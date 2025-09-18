import mongoose from "mongoose";
import * as OrderRepository from "../repositories/order.repository.js";
import * as StockMovementRepository from "../repositories/stockMovement.repository.js";
import * as ShippingService from "../services/shipping.service.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { sendOrderConfirmationEmail, sendShippingNotificationEmail, sendUpdateStatusEmail } from "../middleware/email.middleware.js";

import fs from "fs";
import path from "path";
import crypto from "crypto";

import logger from "../utils/logger.js";

export const create = async (orderData) => {
    const session = await mongoose.startSession();
    let committed = false;
    try {
        session.startTransaction();
        const cancelToken = crypto.randomBytes(24).toString('hex');
        orderData.cancelToken = cancelToken;

        const order = await OrderRepository.createOrder(orderData, session);
        if (!order || !order._id) {
            throw new Error('No se pudo crear la orden, la orden es inválida.');
        }
        const shipping = await ShippingService.createShippingForOrder(order._id, {}, session);
        order.shipping = shipping._id;
        await order.save({ session });
        for (const item of orderData.products) {
            await StockMovementRepository.createStockMovement(
                {
                    product: item.product,
                    size: item.size,
                    color: item.color,
                    quantity: Math.abs(item.quantity),
                    movementType: 'venta',
                    note: `Orden ${order._id} creada`,
                    createdBy: orderData.user,
                },
                session
            );
        }
        await session.commitTransaction();
        committed = true;
        session.endSession();
        return order;
    } catch (error) {
        if (!committed) {
            await session.abortTransaction();
        }
        session.endSession();
        throw new Error(`No se pudo crear la orden: ${error.message}`);
    }
};

export const getAll = async (queryParams) => {
    return await OrderRepository.getAllOrders(queryParams);
};

export const getById = async (id) => {
    const order = await OrderRepository.getOrderById(id);
    if (!order) throw new Error('Pedido no encontrado');
    return order;
};

export const updateStatus = async (id, status) => {
    try {
        const updatedOrder = await OrderRepository.updateOrderStatus(id, status);
        const email = updatedOrder.guestEmail;
        const name = updatedOrder.guestName || 'Cliente';
        if (email) {
            await sendUpdateStatusEmail(
                email,
                name,
                updatedOrder._id,
                status 
            );
        }
        return updatedOrder;
    } catch (error) {
        throw new Error(`Error al actualizar el estado de la orden: ${error.message}`);
    }
};

export const remove = async (id) => {
    return await OrderRepository.deleteOrder(id);
};

export const getOrdersByUserId = async (userId) => {
    return await OrderRepository.getOrdersByUserId(userId);
};

export const updatePaymentInfo = async (orderId, paymentInfo) => {
    const updateData = {
        status: paymentInfo.status === 'approved' ? 'pagado' : 'pendiente', 
        payment: paymentInfo
    };
    const updatedOrder = await OrderRepository.updateOrder(orderId, updateData);
    if (paymentInfo.status === 'approved') {
        await processAfterOrder(updatedOrder);
        if (!updatedOrder.shipping) {
            await ShippingService.createShippingForOrder(updatedOrder._id);
        }
    }
    return updatedOrder;
};

export const updateFields = async (id, fields) => {
    const updatedOrder = await OrderRepository.updateOrder(id, fields);
    return updatedOrder;
};

export const dispatchOrder = async (id, shippingTrackingNumber) => {
    const order = await OrderRepository.getOrderById(id);
    if (!order) {
        throw new Error('Orden no encontrada.');
    }
    let shipping;
    if (order.shipping) {
        shipping = await ShippingService.getShippingById(order.shipping);
        if (!shipping) {
            throw new Error('El envío asociado no fue encontrado.');
        }
        shipping.trackingNumber = shippingTrackingNumber;
        shipping.status = 'en camino';
        await shipping.save();
    } else {
        shipping = await ShippingService.createShippingForOrder(order._id, {
            trackingNumber: shippingTrackingNumber,
            status: 'en camino',
        });
        order.shipping = shipping._id;
    }
    order.status = 'enviado';
    await order.save();
    try {
        const email = order.guestEmail;
        const name = order.guestName || 'Cliente';
        const carrier = shipping?.shippingMethod || 'N/A';
        if (email) {
            await sendShippingNotificationEmail(
                email,
                name,
                order._id,
                shippingTrackingNumber,
                carrier
            );
        }
    } catch (error) {
        throw new Error(`Error enviando email de despacho: ${error.message}.`);
    }
    const updatedOrder = await OrderRepository.getOrderById(order._id);
    return updatedOrder;
};

export const processAfterOrder = async (order) => {
  if (!order || !order._id) {
    throw new Error('Orden inválida para procesamiento posterior.');
  }
  const invoicesDir = path.resolve(process.cwd(), 'invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
    logger.info(`Directorio de invoices creado en ${invoicesDir}`);
  }

  const invoicePath = path.resolve(invoicesDir, `comprobante-${order._id}.pdf`);

  const invoiceExistsOnDisk = fs.existsSync(invoicePath);
  if (!order.invoicePath && !invoiceExistsOnDisk) {
    try {
      await generateInvoice(order, invoicePath);
      logger.info(`Invoice generado: ${invoicePath}`);
      order.invoicePath = invoicePath;
      await order.save();
    } catch (err) {
      logger.error(`Error generando invoice para orden ${order._id}: ${err.message}`);
    }
  } else {
    if (!order.invoicePath && invoiceExistsOnDisk) {
      order.invoicePath = invoicePath;
      await order.save();
      logger.info(`Invoice existente detectado y guardado en order.invoicePath para ${order._id}`);
    } else {
      logger.info(`Invoice ya generado para orden ${order._id}, path: ${order.invoicePath || invoicePath}`);
    }
  }
  const email = order.guestEmail;
  const name = order.guestName || 'Cliente';

  if (email) {
    if (order.confirmationEmailSent) {
      logger.info(`Confirmation email ya enviado para orden ${order._id}, saltando.`);
    } else {
      try {
        await sendOrderConfirmationEmail(
          email,
          name,
          order._id,
          order.totalAmount,
          order.invoicePath || invoicePath,
          order
        );
        order.confirmationEmailSent = true;
        await order.save();
        logger.info(`Email de confirmación enviado a ${email} para orden ${order._id}`);
      } catch (err) {
        logger.error(`Error enviando email de confirmación para orden ${order._id} a ${email}: ${err.message}`);
      }
    }
  } else {
    logger.warn(`Orden ${order._id} no tiene guestEmail, no se envía comprobante por email.`);
  }
  return order.invoicePath || invoicePath;
};

export const getOrdersForShipping = async () => {
    return await OrderRepository.getOrdersForShipping();
};