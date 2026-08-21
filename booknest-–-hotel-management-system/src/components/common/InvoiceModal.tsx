import React from 'react';
import { jsPDF } from 'jspdf';
import { Printer, Download, Building2, X } from 'lucide-react';
import { Modal } from './Modal';

interface InvoiceData {
  hotel_name?: string;
  booking_code: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  room_number: string;
  room_type_name?: string;
  check_in_date: string;
  check_out_date: string;
  room_charge: number;
  additional_charges?: number;
  service_items?: any[];
  tax_amount?: number;
  final_total: number;
  prior_paid?: number;
  received_amount?: number;
  payment_method?: string;
  total_paid: number;
  balance_due: number;
  change_return?: number;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoice }) => {
  if (!invoice) return null;

  const generatePDF = () => {
    const doc = new jsPDF();

    // Header
    const activeHotel = invoice.hotel_name || 'Vlackfie International Hotel';
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text(activeHotel, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('100 Grand Ocean Boulevard, Suite 500', 14, 28);
    doc.text('Phone: 01941575025 | Email: billing@vlackfiehotel.com', 14, 33);

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('GUEST INVOICE', 140, 22);

    doc.setFontSize(10);
    doc.text(`Invoice Ref: INV-${invoice.booking_code}`, 140, 28);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 33);

    doc.line(14, 38, 196, 38);

    // Guest details
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Billed To:', 14, 46);
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Guest Name: ${invoice.guest_name}`, 14, 52);
    doc.text(`Room Number: ${invoice.room_number}`, 14, 57);
    doc.text(`Stay Dates: ${invoice.check_in_date} to ${invoice.check_out_date}`, 14, 62);

    // Items table header
    let y = 72;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 8, 'F');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Item Description', 18, y + 6);
    doc.text('Amount (Tk.)', 160, y + 6);

    y += 14;
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);

    doc.text(`Room Accommodation (${invoice.room_number})`, 18, y);
    doc.text(`Tk. ${invoice.room_charge.toFixed(2)}`, 160, y);
    y += 8;

    if (invoice.service_items && invoice.service_items.length > 0) {
      invoice.service_items.forEach((srv) => {
        doc.text(`Service: ${srv.service_name || 'Hotel Service'} x${srv.quantity || 1}`, 18, y);
        doc.text(`Tk. ${(srv.total_price || 0).toFixed(2)}`, 160, y);
        y += 8;
      });
    }

    if (invoice.additional_charges && invoice.additional_charges > 0) {
      doc.text(`Additional Charges & Fees`, 18, y);
      doc.text(`Tk. ${invoice.additional_charges.toFixed(2)}`, 160, y);
      y += 8;
    }

    doc.line(14, y + 2, 196, y + 2);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Subtotal / Total Charges:`, 110, y);
    doc.text(`Tk. ${invoice.final_total.toFixed(2)}`, 160, y);
    y += 6;

    if (invoice.prior_paid !== undefined && invoice.prior_paid > 0) {
      doc.setTextColor(71, 85, 105);
      doc.text(`Prior Deposit / Payments:`, 110, y);
      doc.text(`Tk. ${invoice.prior_paid.toFixed(2)}`, 160, y);
      y += 6;
    }

    if (invoice.received_amount !== undefined && invoice.received_amount > 0) {
      doc.setTextColor(37, 99, 235);
      doc.text(`Check-Out Received (${invoice.payment_method || 'Cash'}):`, 110, y);
      doc.text(`Tk. ${invoice.received_amount.toFixed(2)}`, 160, y);
      y += 6;
    }

    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129);
    doc.text(`Total Amount Paid:`, 110, y);
    doc.text(`Tk. ${invoice.total_paid.toFixed(2)}`, 160, y);
    y += 7;

    if (invoice.change_return !== undefined && invoice.change_return > 0) {
      doc.setFontSize(11);
      doc.setTextColor(16, 185, 129);
      doc.text(`Change Returned:`, 110, y);
      doc.text(`Tk. ${invoice.change_return.toFixed(2)}`, 160, y);
    } else {
      doc.setFontSize(12);
      doc.setTextColor(225, 29, 72);
      doc.text(`Balance Due:`, 110, y);
      doc.text(`Tk. ${invoice.balance_due.toFixed(2)}`, 160, y);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Thank you for staying at ${activeHotel}. We look forward to welcoming you back!`, 14, 268);
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('Powered by BookNest: A Hotel Management System', 14, 274);

    doc.save(`Invoice_${invoice.booking_code}.pdf`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official Guest Invoice" maxWidth="max-w-3xl">
      <div className="space-y-6">
        <div id="printable-invoice" className="bg-slate-50 dark:bg-slate-900/80 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xl">
                <Building2 className="w-6 h-6" />
                <span>{invoice.hotel_name || 'Vlackfie International Hotel'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">100 Grand Ocean Blvd, Suite 500</p>
              <p className="text-xs text-slate-500">Phone: 01941575025 | VAT: 91823901</p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Invoice</span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">INV-{invoice.booking_code}</p>
              <p className="text-xs text-slate-500">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">Billed To</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{invoice.guest_name}</p>
              {invoice.guest_email && <p className="text-slate-600 dark:text-slate-300">{invoice.guest_email}</p>}
              {invoice.guest_phone && <p className="text-slate-600 dark:text-slate-300">{invoice.guest_phone}</p>}
            </div>
            <div className="text-right">
              <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">Stay Details</span>
              <p className="text-slate-700 dark:text-slate-300">Room: <span className="font-bold text-slate-900 dark:text-white">{invoice.room_number}</span></p>
              <p className="text-slate-700 dark:text-slate-300">Dates: {invoice.check_in_date} to {invoice.check_out_date}</p>
            </div>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
              <tr>
                <th className="p-2.5">Item Description</th>
                <th className="p-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-2.5 text-slate-800 dark:text-slate-200">Room Accommodation Charge</td>
                <td className="p-2.5 text-right font-medium text-slate-900 dark:text-white">৳{invoice.room_charge.toFixed(2)}</td>
              </tr>
              {invoice.service_items && invoice.service_items.map((srv, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 text-slate-800 dark:text-slate-200">{srv.service_name || 'Room Service Order'} (x{srv.quantity || 1})</td>
                  <td className="p-2.5 text-right font-medium text-slate-900 dark:text-white">৳{(srv.total_price || 0).toFixed(2)}</td>
                </tr>
              ))}
              {invoice.additional_charges ? (
                <tr>
                  <td className="p-2.5 text-slate-800 dark:text-slate-200">Additional Charges & Incidentals</td>
                  <td className="p-2.5 text-right font-medium text-slate-900 dark:text-white">৳{invoice.additional_charges.toFixed(2)}</td>
                </tr>
              ) : null}
            </tbody>
          </table>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col items-end space-y-1.5 text-xs">
            <div className="flex justify-between w-72 text-slate-600 dark:text-slate-300">
              <span>Total Gross Charges:</span>
              <span className="font-bold text-slate-900 dark:text-white">৳{invoice.final_total.toFixed(2)}</span>
            </div>
            {invoice.prior_paid !== undefined && invoice.prior_paid > 0 && (
              <div className="flex justify-between w-72 text-slate-500">
                <span>Prior Deposit / Payments:</span>
                <span className="font-medium">৳{invoice.prior_paid.toFixed(2)}</span>
              </div>
            )}
            {invoice.received_amount !== undefined && invoice.received_amount > 0 && (
              <div className="flex justify-between w-72 text-blue-600 dark:text-blue-400 font-semibold">
                <span>Check-Out Received ({invoice.payment_method || 'Cash'}):</span>
                <span>৳{invoice.received_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between w-72 text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Total Amount Paid:</span>
              <span>৳{invoice.total_paid.toFixed(2)}</span>
            </div>
            {invoice.change_return !== undefined && invoice.change_return > 0 ? (
              <div className="flex justify-between w-72 text-emerald-600 dark:text-emerald-400 font-extrabold border-t border-slate-200 dark:border-slate-800 pt-1.5">
                <span>Change Returned:</span>
                <span>৳{invoice.change_return.toFixed(2)}</span>
              </div>
            ) : (
              <div className="flex justify-between w-72 text-sm font-extrabold text-rose-600 dark:text-rose-400 border-t border-slate-200 dark:border-slate-800 pt-1.5">
                <span>Balance Due:</span>
                <span>৳{invoice.balance_due.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>Thank you for staying at {invoice.hotel_name || 'our hotel'}! We look forward to welcoming you back.</span>
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              Powered by <strong className="text-blue-600 dark:text-blue-400 font-bold">BookNest: A Hotel Management System</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
          <button
            type="button"
            onClick={generatePDF}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
