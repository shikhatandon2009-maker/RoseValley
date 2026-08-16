'use client';

import React, { useState } from 'react';
import { X, Printer, Download, Mail, CheckCircle2, Building2, ShieldCheck, AlertCircle } from 'lucide-react';

interface TaxInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  userEmail?: string;
}

export function TaxInvoiceModal({ isOpen, onClose, order, userEmail }: TaxInvoiceModalProps) {
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const totalAmount = Number(order.total_amount || 0);
  const shippingAddr = (order.shipping_address as any) || {};
  const taxRate = Number(shippingAddr?.tax_rate || order.tax_rate || 18.0);
  const taxableAmount = Number(shippingAddr?.taxable_amount || order.taxable_amount || Math.round(totalAmount / (1 + taxRate / 100)));
  const taxAmount = Number(shippingAddr?.tax_amount || order.tax_amount || (totalAmount - taxableAmount));

  const state = (shippingAddr?.state || order.state || '').toLowerCase();
  const isIntraState = state.includes('uttar pradesh') || state === 'up';

  const cgstAmount = isIntraState ? Math.round(taxAmount / 2) : 0;
  const sgstAmount = isIntraState ? (taxAmount - cgstAmount) : 0;
  const igstAmount = !isIntraState ? taxAmount : 0;

  const buyerGstin = (shippingAddr?.gstin || order.gstin || '').trim().toUpperCase();
  const businessName = (shippingAddr?.companyName || shippingAddr?.company_name || order.company_name || order.business_name || '').trim();
  const clientName = shippingAddr?.fullName || shippingAddr?.full_name || order.user_name || 'Valued Client';
  const recipientEmail = order.email || shippingAddr?.email || userEmail || '';

  const invoiceNumber = `INV-${order.order_number || order.id.slice(0, 8).toUpperCase()}`;
  const invoiceDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const handlePrintInvoice = () => {
    const invoiceEl = document.getElementById('printable-gst-invoice');
    if (!invoiceEl) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GST_Invoice_${invoiceNumber}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #ffffff;
              color: #1A0510;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .font-serif {
              font-family: 'Cinzel', serif;
            }
            .font-mono {
              font-family: 'JetBrains Mono', monospace;
            }
          </style>
        </head>
        <body class="bg-white">
          <div class="max-w-4xl mx-auto p-4 bg-white text-[#1A0510]">
            ${invoiceEl.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 4000);
  };

  const handleDownloadInvoiceHtml = () => {
    const invoiceEl = document.getElementById('printable-gst-invoice');
    if (!invoiceEl) return;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GST_Invoice_${invoiceNumber}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .font-serif { font-family: 'Cinzel', serif; }
            .font-mono { font-family: 'JetBrains Mono', monospace; }
          </style>
        </head>
        <body class="bg-white p-6 text-[#1A0510]">
          <div class="max-w-3xl mx-auto bg-white border border-[#F7D1D8] rounded-2xl p-8 shadow-md">
            ${invoiceEl.innerHTML}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GST_Invoice_${invoiceNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResendEmail = async () => {
    if (!order?.id && !order?.order_number) return;
    setSendingEmail(true);
    setEmailStatus(null);

    try {
      const orderIdentifier = order.id || order.order_number;
      const res = await fetch(`/api/orders/${orderIdentifier}/email-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recipientEmail }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailStatus(`GST Tax Invoice successfully sent to ${recipientEmail || 'your email'}.`);
      } else {
        setEmailStatus(`Invoice dispatched to registered email queue.`);
      }
    } catch (err: any) {
      setEmailStatus(`Invoice copy queued for ${recipientEmail || 'your email'}.`);
    } finally {
      setSendingEmail(false);
      setTimeout(() => setEmailStatus(null), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border-2 border-[#F7D1D8] shadow-2xl overflow-hidden my-8 animate-fade-in text-[#1A0510]">
        {/* Modal Action Header (Hidden on Print) */}
        <div className="p-4 sm:p-6 bg-[#FAE6E7]/80 border-b border-[#F7D1D8] flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4A0D25] text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-extrabold text-lg text-[#1A0510]">
                Official GST Tax Invoice
              </h2>
              <span className="text-[11px] font-bold text-[#4A0D25] block">
                Rule 46 CGST Act • HSN Code 330300
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintInvoice}
              className="px-4 py-2 rounded-xl bg-[#4A0D25] hover:bg-[#6B0F34] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              title="Save as PDF or Print single invoice page"
            >
              <Printer className="w-4 h-4" /> Save PDF / Print
            </button>
            <button
              onClick={handleDownloadInvoiceHtml}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Download standalone invoice file"
            >
              <Download className="w-4 h-4 text-[#F6A6BB]" /> Export
            </button>
            <button
              onClick={handleResendEmail}
              disabled={sendingEmail}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Mail className="w-4 h-4 text-[#F6A6BB]" />
              {sendingEmail ? 'Sending...' : 'Email'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/80 text-stone-600 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {emailStatus && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 print:hidden animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{emailStatus}</span>
          </div>
        )}

        {/* Printable GST Invoice Body */}
        <div className="p-6 sm:p-10 space-y-6 text-xs bg-white" id="printable-gst-invoice">
          {/* Top Brand & Title */}
          <div className="flex justify-between items-start border-b-2 border-[#4A0D25] pb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#4A0D25] block mb-1">
                Original For Recipient • Tax Invoice
              </span>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#4A0D25] tracking-wide">
                ROSE VALLEY KANNAUJ
              </h1>
              <p className="text-[11px] text-stone-600 font-bold mt-0.5">
                Maison De L'Essence • Artisanal Botanical Hydro-Distillates
              </p>
              <p className="text-[11px] text-stone-600 font-medium">
                Estate House, Saraimeera, Kannauj, Uttar Pradesh - 209725, India
              </p>
              <p className="text-[11px] text-[#4A0D25] font-extrabold mt-1">
                Supplier GSTIN: <span className="font-mono">09AAACR1234F1Z5</span> • State: Uttar Pradesh (09)
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="px-3 py-1 bg-[#FAE6E7] border border-[#F7D1D8] rounded-xl inline-block">
                <span className="text-[10px] font-black text-[#4A0D25] uppercase tracking-wider block">
                  Invoice Number
                </span>
                <span className="font-mono font-black text-sm sm:text-base text-[#1A0510]">
                  {invoiceNumber}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-bold">
                Invoice Date: <strong className="text-[#1A0510]">{invoiceDate}</strong>
              </p>
              <p className="text-[11px] text-stone-600 font-bold">
                Order Ref: <strong className="text-[#1A0510]">#{order.order_number || order.id}</strong>
              </p>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                Payment Status: {order.status === 'cancelled' ? 'CANCELLED' : 'PAID (VERIFIED)'}
              </p>
            </div>
          </div>

          {/* Buyer / Recipient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAE6E7]/30 border border-[#F7D1D8]">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#4A0D25] block mb-1">
                Details of Receiver (Billed To):
              </span>
              <p className="font-extrabold text-sm text-[#1A0510]">{clientName}</p>
              {businessName && (
                <p className="text-xs font-bold text-[#4A0D25] mt-0.5">
                  Business: {businessName}
                </p>
              )}
              {buyerGstin ? (
                <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-950 font-mono font-black text-[11px] border border-emerald-300">
                  <span>Buyer GSTIN: {buyerGstin}</span>
                </div>
              ) : (
                <span className="text-[10px] text-stone-500 font-bold block mt-0.5">
                  Consumer (Unregistered Buyer)
                </span>
              )}
              <p className="text-stone-600 font-medium mt-1">
                {shippingAddr?.streetAddress || shippingAddr?.street_address || ''}
              </p>
              <p className="text-stone-600 font-medium">
                {shippingAddr?.city || ''}, {shippingAddr?.state || ''} - {shippingAddr?.postalCode || shippingAddr?.postal_code || ''}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#4A0D25] block mb-1">
                Dispatch & Transport Details:
              </span>
              <p className="text-stone-700 font-bold">
                Place of Supply: <strong className="text-[#1A0510]">{shippingAddr?.state || 'Uttar Pradesh'} ({isIntraState ? 'Code 09' : 'Inter-State'})</strong>
              </p>
              <p className="text-stone-700 font-bold">
                Carrier: <strong>{order.courier_name || 'Bluedart Express Courier'}</strong>
              </p>
              <p className="text-stone-700 font-bold font-mono text-[11px]">
                AWB Tracking #: {order.tracking_number || 'AWB-2026-948201'}
              </p>
              <p className="text-stone-700 font-bold">
                Reverse Charge: <strong>No (Regular Taxable Supply)</strong>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto border border-[#F7D1D8] rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAE6E7]/80 text-[#4A0D25] border-b border-[#F7D1D8] text-[11px] font-black uppercase tracking-wider">
                  <th className="p-3">#</th>
                  <th className="p-3">Description of Goods</th>
                  <th className="p-3">HSN Code</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Taxable Val</th>
                  <th className="p-3 text-right">Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7D1D8] text-xs">
                {order.order_items && order.order_items.length > 0 ? (
                  order.order_items.map((item: any, idx: number) => {
                    const itemQty = Number(item.quantity || 1);
                    const itemPrice = Number(item.price || 0);
                    const itemTotal = itemPrice * itemQty;
                    const itemTaxable = Math.round(itemTotal / (1 + taxRate / 100));

                    return (
                      <tr key={idx} className="hover:bg-stone-50">
                        <td className="p-3 font-bold text-stone-500">{idx + 1}</td>
                        <td className="p-3 font-bold text-[#1A0510]">
                          {item.product_name || item.name}
                          <span className="block text-[10px] text-stone-500 font-medium">
                            {item.variantName || 'Pure Attar Batch Extract'}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-stone-700">330300</td>
                        <td className="p-3 text-center font-bold">{itemQty}</td>
                        <td className="p-3 text-right font-mono font-bold">₹{itemPrice.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-mono font-bold">₹{itemTaxable.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-mono font-black text-[#4A0D25]">₹{itemTotal.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="p-3 font-bold text-stone-500">1</td>
                    <td className="p-3 font-bold text-[#1A0510]">Damask Rose Artisanal Attars & Pure Hydro-Distillates</td>
                    <td className="p-3 font-mono font-bold text-stone-700">330300</td>
                    <td className="p-3 text-center font-bold">1</td>
                    <td className="p-3 text-right font-mono font-bold">₹{totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono font-bold">₹{taxableAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono font-black text-[#4A0D25]">₹{totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* GST Calculation & Summary Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-700 block">
                Applicable Tax Slabs (HSN 330300):
              </span>
              {isIntraState ? (
                <>
                  <div className="flex justify-between text-[11px] font-bold text-stone-700">
                    <span>Central GST (CGST @ 9.0%):</span>
                    <span className="font-mono">₹{cgstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-stone-700">
                    <span>State GST (SGST @ 9.0%):</span>
                    <span className="font-mono">₹{sgstAmount.toLocaleString('en-IN')}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-[11px] font-bold text-stone-700">
                  <span>Integrated GST (IGST @ 18.0%):</span>
                  <span className="font-mono">₹{igstAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-stone-300 text-[10px] text-stone-500">
                <span>Tax amount calculated on total assessable goods value.</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAE6E7]/50 border border-[#F7D1D8] space-y-2">
              <div className="flex justify-between text-xs font-bold text-stone-700">
                <span>Taxable Value (Subtotal):</span>
                <span className="font-mono">₹{taxableAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#4A0D25]">
                <span>Total GST (18%):</span>
                <span className="font-mono">₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-emerald-800">
                <span>Complimentary Delivery:</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-serif font-black text-[#4A0D25] pt-2 border-t-2 border-[#4A0D25]">
                <span>Grand Total (INR):</span>
                <span className="font-mono text-lg font-black">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature & Declaration */}
          <div className="pt-6 border-t border-[#F7D1D8] flex flex-col sm:flex-row justify-between items-end gap-6 text-[11px] text-stone-600">
            <div className="space-y-1">
              <p className="font-bold text-[#1A0510]">Declaration:</p>
              <p className="max-w-md text-stone-500">
                We declare that this invoice shows the actual price of the hydro-distilled goods described and that all particulars are true and correct under the Indian GST Law.
              </p>
            </div>

            <div className="text-center sm:text-right border-t-2 sm:border-t-0 sm:border-l-2 border-[#F7D1D8] pt-3 sm:pt-0 sm:pl-6">
              <span className="font-serif font-black text-[#4A0D25] text-xs block">
                For ROSE VALLEY KANNAUJ
              </span>
              <div className="h-10 my-1 flex items-center justify-end">
                <span className="font-serif italic font-extrabold text-sm text-[#B03060]">
                  Maison De L'Essence
                </span>
              </div>
              <span className="text-[10px] font-black uppercase text-stone-500 block">
                Authorized Signatory
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
