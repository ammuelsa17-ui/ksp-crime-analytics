/**
 * PII Data Masking Utility for Karnataka State Police Compliance
 * Automatically masks sensitive PII (Aadhaar, Phone, Home Address) for lower access roles.
 */

export function maskPhone(phone, userRole) {
  if (!phone) return 'N/A';
  if (['DGP', 'SP', 'Inspector'].includes(userRole)) {
    return phone;
  }
  return phone.replace(/(\+\d{2}\s?\d{2})\d{4}(\d{4})/, '$1-XXXX-$2');
}

export function maskAadhaar(aadhaar, userRole) {
  if (!aadhaar) return 'XXXX-XXXX-8812';
  if (['DGP', 'SP'].includes(userRole)) {
    return aadhaar;
  }
  return 'XXXX-XXXX-' + aadhaar.slice(-4);
}

export function maskAddress(address, userRole) {
  if (!address) return 'Restricted Location';
  if (['DGP', 'SP', 'Inspector'].includes(userRole)) {
    return address;
  }
  return address.split(',')[0] + ', [Address Masked for Constable/Operator]';
}
