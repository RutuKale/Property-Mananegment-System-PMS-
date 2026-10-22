import React from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck, Hotel } from 'lucide-react';
import { formatINR } from '../../services/pricingCalculators';
import { useHotel } from '../../context/HotelContext';

export default function PrintableInvoiceModal({ invoice, isOpen, onClose }) {
  const { hotelSettings } = useHotel();

  if (!isOpen || !invoice) return null;

  // Generate standalone HTML for isolated iframe printing (PDF Page 8)
  const generateStandaloneInvoiceHtml = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Invoice - ${invoice.invoiceNumber}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; 
            color: #1e293b; 
            padding: 40px; 
            background: #fff;
            line-height: 1.5;
          }
          .invoice-box { max-width: 800px; margin: auto; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 25px; }
          .brand h1 { font-size: 24px; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
          .brand p { font-size: 12px; color: #64748b; margin-top: 4px; }
          .meta { text-align: right; }
          .badge { display: inline-block; background: #0f172a; color: #fff; font-size: 11px; padding: 4px 10px; border-radius: 4px; font-weight: bold; }
          .meta p { font-size: 12px; color: #334155; margin-top: 6px; }
          .details-grid { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 6px; }
          .col h4 { font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
          .col p { font-size: 13px; color: #0f172a; font-weight: 500; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #0f172a; color: #ffffff; text-align: left; padding: 10px 12px; font-size: 12px; text-transform: uppercase; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .text-right { text-align: right; }
          .totals-table { width: 340px; margin-left: auto; margin-bottom: 30px; }
          .totals-table td { padding: 6px 12px; border: none; }
          .totals-table tr.grand-total { border-top: 2px solid #0f172a; font-weight: bold; font-size: 16px; color: #0f172a; }
          .footer-note { border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 11px; color: #64748b; text-align: center; }
          .tax-split { background: #f1f5f9; padding: 10px; border-radius: 4px; margin-top: 15px; font-size: 11px; color: #475569; }
          @media print {
            body { padding: 15px; }
            @page { margin: 1cm; size: A4; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="brand">
              <h1>${hotelSettings.name}</h1>
              <p>${hotelSettings.address}</p>
              <p>GSTIN: <strong>${invoice.gstin || hotelSettings.gstin}</strong> | SAC Code: <strong>996311</strong></p>
              <p>Phone: ${hotelSettings.receptionPhone} | Email: ${hotelSettings.receptionEmail}</p>
            </div>
            <div class="meta">
              <span class="badge">TAX INVOICE</span>
              <p>Invoice No: <strong>${invoice.invoiceNumber}</strong></p>
              <p>Booking Ref: <strong>${invoice.bookingId}</strong></p>
              <p>Date: ${new Date(invoice.generatedAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          <div class="details-grid">
            <div class="col">
              <h4>Billed To (Guest)</h4>
              <p>${invoice.guestName}</p>
              <p style="font-size: 12px; color: #64748b;">${invoice.guestPhone}</p>
            </div>
            <div class="col">
              <h4>Accommodation Details</h4>
              <p>Room ${invoice.roomNumber}</p>
              <p style="font-size: 12px; color: #64748b;">Nights Billed: ${invoice.nights || 1}</p>
            </div>
            <div class="col">
              <h4>Settlement Mode</h4>
              <p>${invoice.paymentMethod || 'Multi-Channel'}</p>
              <p style="font-size: 12px; color: ${invoice.balanceDue > 0 ? '#b91c1c' : '#15803d'}; font-weight: bold;">
                ${invoice.balanceDue > 0 ? 'Balance Due: ₹' + invoice.balanceDue : 'Fully Paid'}
              </p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>SAC</th>
                <th>Qty (Nights)</th>
                <th class="text-right">Taxable Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Hotel Accommodation & Luxury Lodging</strong><br>
                  <span style="font-size: 11px; color: #64748b;">Room ${invoice.roomNumber} stay tariff & hospitality service</span>
                </td>
                <td>${invoice.sacCode || '996311'}</td>
                <td>${invoice.nights || 1}</td>
                <td class="text-right">₹${Number(invoice.taxableAmount).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <table class="totals-table">
            <tr>
              <td>Taxable Value (Subtotal):</td>
              <td class="text-right">₹${Number(invoice.taxableAmount).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>CGST (6%):</td>
              <td class="text-right">₹${Number(invoice.cgstAmount).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>SGST (6%):</td>
              <td class="text-right">₹${Number(invoice.sgstAmount).toLocaleString('en-IN')}</td>
            </tr>
            <tr class="grand-total">
              <td>Total Amount (Incl. GST):</td>
              <td class="text-right">₹${Number(invoice.totalAmount).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Amount Paid:</td>
              <td class="text-right" style="color: #15803d; font-weight: bold;">₹${Number(invoice.amountPaid).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Balance Due:</td>
              <td class="text-right" style="color: ${invoice.balanceDue > 0 ? '#b91c1c' : '#64748b'}; font-weight: bold;">
                ₹${Number(invoice.balanceDue).toLocaleString('en-IN')}
              </td>
            </tr>
          </table>

          <div class="tax-split">
            <strong>Tax Breakdown Declaration (SAC 996311):</strong>
            Applicable tax rate is 12% split equally as 6% Central Goods and Services Tax (CGST) and 6% State Goods and Services Tax (SGST).
          </div>

          <div class="footer-note" style="margin-top: 30px;">
            <p>This is a computer-generated official tax invoice and does not require a physical signature.</p>
            <p>Thank you for choosing ${hotelSettings.name}. We look forward to welcoming you again.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Trigger Isolated Iframe Print Engine (PDF Section 7)
  const handlePrint = () => {
    let iframe = document.getElementById('hotel-invoice-print-frame');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'hotel-invoice-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(generateStandaloneInvoiceHtml());
    doc.close();

    // Trigger print after iframe renders
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 bg-brand-gold/20 text-brand-gold rounded-lg border border-brand-gold/30 flex-shrink-0">
              <Hotel className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 truncate">
                <span>Official Tax Invoice</span>
                <span className="text-[10px] sm:text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 flex-shrink-0">
                  SAC 996311
                </span>
              </h3>
              <p className="text-xs text-slate-400 truncate">
                Invoice #{invoice.invoiceNumber} • {invoice.guestName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Visual Folio Body */}
        <div className="p-3 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-slate-50/50">
          <div id="printable-receipt" className="bg-white p-4 sm:p-8 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
            
            {/* Top Brand & Meta */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 pb-6 border-b-2 border-slate-900">
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 uppercase">
                  {hotelSettings.name}
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  {hotelSettings.address}
                </p>
                <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                  <p>GSTIN: <span className="font-mono font-semibold">{invoice.gstin || hotelSettings.gstin}</span></p>
                  <p>Phone: {hotelSettings.receptionPhone}</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block bg-slate-900 text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded">
                  TAX INVOICE
                </span>
                <p className="text-sm font-bold font-mono text-slate-900 mt-2">
                  {invoice.invoiceNumber}
                </p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Ref: {invoice.bookingId}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(invoice.generatedAt || Date.now()).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Bill Details Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-6 bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs">
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Guest</p>
                <p className="text-sm font-semibold text-slate-900">{invoice.guestName}</p>
                <p className="text-xs text-slate-500">{invoice.guestPhone}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Room Allocated</p>
                <p className="text-sm font-semibold text-slate-900">Room {invoice.roomNumber}</p>
                <p className="text-xs text-slate-500">{invoice.nights || 1} Night(s) Stay</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Payment Status</p>
                <p className="text-xs font-semibold text-slate-700">{invoice.paymentMethod || 'Completed'}</p>
                <p className={`text-xs font-bold mt-0.5 ${invoice.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {invoice.balanceDue > 0 ? `Due: ${formatINR(invoice.balanceDue)}` : 'Fully Settled'}
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs mb-6">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="py-2.5 px-3 rounded-l">Item Description</th>
                    <th className="py-2.5 px-3">SAC Code</th>
                    <th className="py-2.5 px-3 text-center">Nights</th>
                    <th className="py-2.5 px-3 text-right rounded-r">Taxable Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">Hotel Accommodation Charges</p>
                      <p className="text-[11px] text-slate-500">Luxury room tariff and hospitality services</p>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{invoice.sacCode || '996311'}</td>
                    <td className="py-3 px-3 text-center text-slate-700">{invoice.nights || 1}</td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">
                      {formatINR(invoice.taxableAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculation Totals */}
            <div className="flex justify-end pt-2">
              <div className="w-72 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Subtotal:</span>
                  <span className="font-medium text-slate-900">{formatINR(invoice.taxableAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CGST (6%):</span>
                  <span className="font-medium text-slate-900">{formatINR(invoice.cgstAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST (6%):</span>
                  <span className="font-medium text-slate-900">{formatINR(invoice.sgstAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-700 font-semibold border-t border-slate-200 pt-2 text-sm">
                  <span>Total Payable:</span>
                  <span className="text-slate-900">{formatINR(invoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Paid Amount:</span>
                  <span>{formatINR(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-slate-700 font-bold border-t border-dashed border-slate-200 pt-1.5">
                  <span>Balance Due:</span>
                  <span className={invoice.balanceDue > 0 ? 'text-rose-600' : 'text-slate-500'}>
                    {formatINR(invoice.balanceDue)}
                  </span>
                </div>
              </div>
            </div>

            {/* GST SAC Notice */}
            <div className="mt-8 p-3 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>GST SAC 996311 Compliance:</strong> 12% statutory tax is divided equally into 6% CGST and 6% SGST per the Central Board of Indirect Taxes and Customs (CBIC) luxury hospitality tariff guidelines.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between border-t border-slate-200 gap-3 flex-shrink-0">
          <p className="text-[11px] text-slate-500 text-center sm:text-left">
            Isolated Iframe print removes all web navigation & headers automatically.
          </p>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-center"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Tax Invoice
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
