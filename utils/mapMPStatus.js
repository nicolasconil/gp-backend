export default function mapMPStatus (mpStatus) {
    switch (mpStatus) {
        case 'approved': return 'aprobado';
        case 'in_process':
        case 'pending': return 'pendiente';
        case 'rejected': 
        default: return 'rechazado';
    } 
}