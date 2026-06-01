<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\RoomCharge;
use Illuminate\Http\Request;

class FinanceController extends Controller
{
    public function getInvoices(Request $request)
    {
        $role = $request->attributes->get('user_role');
        $userId = $request->attributes->get('user_id');

        if ($role === 'guest') {
            return response()->json(Invoice::where('guest_id', $userId)->get());
        }

        return response()->json(Invoice::all());
    }

    public function createInvoice(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|integer',
            'guest_id' => 'required|integer',
            'guest_name' => 'required|string',
            'guest_email' => 'required|string',
            'base_charge' => 'required|numeric'
        ]);

        $subtotal = $request->base_charge;
        $tax = $subtotal * 0.12; // 12% standard Philippine VAT
        $total = $subtotal + $tax;

        $invoice = Invoice::create([
            'booking_id' => $request->booking_id,
            'guest_id' => $request->guest_id,
            'guest_name' => $request->guest_name,
            'guest_email' => $request->guest_email,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total_amount' => $total,
            'payment_status' => 'Unpaid'
        ]);

        // Automatically log the base booking fee as the first room charge item
        RoomCharge::create([
            'invoice_id' => $invoice->id,
            'charge_description' => 'Fisher El Stay Room Booking Fee',
            'amount' => $request->base_charge
        ]);

        return response()->json([
            'message' => 'Invoice initialized successfully',
            'invoice' => $invoice
        ], 201);
    }

    public function getInvoiceById(Request $request, $id)
    {
        $invoice = Invoice::with(['payments', 'roomCharges'])->findOrFail($id);
        $role = $request->attributes->get('user_role');
        $userId = $request->attributes->get('user_id');

        if ($role === 'guest' && $invoice->guest_id !== $userId) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        return response()->json($invoice);
    }

    public function getInvoiceByBooking(Request $request, $bookingId)
    {
        $invoice = Invoice::with(['payments', 'roomCharges'])->where('booking_id', $bookingId)->firstOrFail();
        $role = $request->attributes->get('user_role');
        $userId = $request->attributes->get('user_id');

        if ($role === 'guest' && $invoice->guest_id !== $userId) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        return response()->json($invoice);
    }

    public function addRoomCharge(Request $request, $id)
    {
        $role = $request->attributes->get('user_role');
        if ($role !== 'receptionist' && $role !== 'manager') {
            return response()->json(['error' => 'Unauthorized action'], 403);
        }

        $invoice = Invoice::findOrFail($id);
        
        $request->validate([
            'charge_description' => 'required|string',
            'amount' => 'required|numeric|min:0.01'
        ]);

        RoomCharge::create([
            'invoice_id' => $invoice->id,
            'charge_description' => $request->charge_description,
            'amount' => $request->amount
        ]);

        // Recalculate totals
        $subtotal = RoomCharge::where('invoice_id', $invoice->id)->sum('amount');
        $tax = $subtotal * 0.12;
        $total = $subtotal + $tax;

        $invoice->subtotal = $subtotal;
        $invoice->tax = $tax;
        $invoice->total_amount = $total;
        
        // If they add charges after paying, status resets to Unpaid
        if ($invoice->payment_status === 'Paid') {
            $invoice->payment_status = 'Unpaid';
        }
        $invoice->save();

        return response()->json([
            'message' => 'Room charge added and invoice totals updated',
            'invoice' => $invoice->load(['payments', 'roomCharges'])
        ]);
    }

    public function payInvoice(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:Credit Card,Check,Cash',
            'transaction_reference' => 'nullable|string'
        ]);

        $payment = Payment::create([
            'invoice_id' => $invoice->id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'transaction_reference' => $request->transaction_reference ?? uniqid('PAY-')
        ]);

        // Calculate total payments received
        $totalPaid = Payment::where('invoice_id', $invoice->id)->sum('amount');

        if ($totalPaid >= $invoice->total_amount) {
            $invoice->payment_status = 'Paid';
        } else {
            $invoice->payment_status = 'Partially Paid';
        }
        $invoice->save();

        return response()->json([
            'message' => 'Payment recorded successfully',
            'payment' => $payment,
            'invoice' => $invoice->load(['payments', 'roomCharges'])
        ]);
    }

    public function getAnalytics(Request $request)
    {
        $role = $request->attributes->get('user_role');
        if ($role !== 'manager') {
            return response()->json(['error' => 'Access denied. Managers only.'], 403);
        }

        // Dashboard analytics
        $totalRevenue = Payment::sum('amount');
        $invoiceCount = Invoice::count();
        $unpaidInvoices = Invoice::where('payment_status', 'Unpaid')->count();
        $paidInvoices = Invoice::where('payment_status', 'Paid')->count();

        // Standard mock analytical chart points for Fisher El room-revenue
        $dailyEarnings = [
            'Monday' => Payment::whereRaw('weekday(created_at) = 0')->sum('amount') ?: 1200,
            'Tuesday' => Payment::whereRaw('weekday(created_at) = 1')->sum('amount') ?: 1800,
            'Wednesday' => Payment::whereRaw('weekday(created_at) = 2')->sum('amount') ?: 1400,
            'Thursday' => Payment::whereRaw('weekday(created_at) = 3')->sum('amount') ?: 2400,
            'Friday' => Payment::whereRaw('weekday(created_at) = 4')->sum('amount') ?: 4500,
            'Saturday' => Payment::whereRaw('weekday(created_at) = 5')->sum('amount') ?: 6200,
            'Sunday' => Payment::whereRaw('weekday(created_at) = 6')->sum('amount') ?: 5100,
        ];

        return response()->json([
            'total_revenue' => $totalRevenue,
            'invoice_count' => $invoiceCount,
            'unpaid_count' => $unpaidInvoices,
            'paid_count' => $paidInvoices,
            'earnings_chart' => $dailyEarnings
        ]);
    }
}
