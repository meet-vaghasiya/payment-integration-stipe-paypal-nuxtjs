import PDFDocument from 'pdfkit';
import Stripe from 'stripe';
import { Readable } from 'stream';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const sessionId = query.session_id as string;

    if (!sessionId) {
      throw createError({
        statusCode: 400,
        message: 'Session ID is required',
      });
    }

    // Fetch session data from Stripe

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details'],
    });

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Header
    doc.fontSize(25).text('Invoice', { align: 'center' });
    doc.moveDown();

    // Company Info
    doc
      .fontSize(12)
      .text('Your Company Name', { align: 'right' })
      .text('123 Business Street', { align: 'right' })
      .text('contact@yourcompany.com', { align: 'right' });

    doc.moveDown();

    // Customer Info
    doc
      .fontSize(12)
      .text(`Invoice Date: ${new Date().toLocaleDateString()}`)
      .text(`Invoice #: INV-${sessionId.slice(-8)}`)
      .text(`Customer: ${session.customer_details?.email || 'N/A'}`);

    doc.moveDown();

    // Table Header
    const tableTop = 250;
    doc
      .fontSize(12)
      .text('Item', 50, tableTop)
      .text('Quantity', 250, tableTop)
      .text('Price', 350, tableTop)
      .text('Amount', 450, tableTop);

    // Underline
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Table Content
    let position = tableTop + 30;
    session.line_items?.data.forEach((item) => {
      doc
        .text(item.description || 'Product', 50, position)
        .text(item.quantity?.toString() || '1', 250, position)
        .text(
          `$${((item.price?.unit_amount || 0) / 100).toFixed(2)}`,
          350,
          position
        )
        .text(`$${(item.amount_total / 100).toFixed(2)}`, 450, position);

      position += 20;
    });

    // Total
    doc
      .moveTo(50, position + 15)
      .lineTo(550, position + 15)
      .stroke();

    doc
      .fontSize(12)
      .text('Total:', 350, position + 30)
      .text(`$${(session.amount_total / 100).toFixed(2)}`, 450, position + 30);

    // Footer
    doc
      .fontSize(10)
      .text('Thank you for your business!', 50, 700, { align: 'center' });

    // Set response headers
    setResponseHeaders(event, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${sessionId}.pdf"`,
    });

    // Convert PDF to buffer
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });
      doc.on('error', reject);
      doc.end();
    });
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }
});
