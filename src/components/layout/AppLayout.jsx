import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import WalkInCheckInModal from '../modals/WalkInCheckInModal';
import CheckoutModal from '../modals/CheckoutModal';
import RoomDetailsModal from '../modals/RoomDetailsModal';
import PrintableInvoiceModal from '../modals/PrintableInvoiceModal';
import { useHotel } from '../../context/HotelContext';

export default function AppLayout() {
  const { rooms, bookings, invoices } = useHotel();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global Modals State
  const [checkInModalRoom, setCheckInModalRoom] = useState(null);
  const [checkoutModalData, setCheckoutModalData] = useState(null); // { room, booking }
  const [roomDetailsModalRoom, setRoomDetailsModalRoom] = useState(null);
  const [printInvoiceData, setPrintInvoiceData] = useState(null);

  // Global Trigger: Launch Check-In
  const handleLaunchCheckIn = (room = null) => {
    // If no room specified, pick first available room
    const targetRoom = room || rooms.find(r => r.status === 'available');
    if (targetRoom) {
      setCheckInModalRoom(targetRoom);
    } else {
      alert("No rooms are currently marked Available in inventory.");
    }
  };

  // Global Trigger: Launch Checkout
  const handleLaunchCheckout = (room) => {
    const activeBooking = bookings.find(b => 
      (b.id === room.activeBookingId || b.bookingId === room.activeBookingId) ||
      (b.roomId === room.roomId && (b.status === 'checked_in' || b.status === 'checkout_due'))
    );
    if (activeBooking) {
      setCheckoutModalData({ room, booking: activeBooking });
    } else {
      // Fallback pseudo-booking for immediate checkout handling
      const pseudoBooking = {
        bookingId: `BK-TEMP-${room.roomNumber}`,
        id: `bk-temp-${room.roomNumber}`,
        roomId: room.roomId,
        roomNumber: room.roomNumber,
        guestName: "In-House Guest",
        guestPhone: "+91 98765 00000",
        nights: 1,
        subtotal: room.pricePerNight,
        cgstAmount: room.pricePerNight * 0.06,
        sgstAmount: room.pricePerNight * 0.06,
        totalTax: room.pricePerNight * 0.12,
        totalAmount: room.pricePerNight * 1.12,
        amountPaid: room.pricePerNight * 1.12,
        balanceDue: 0,
        status: 'checked_in',
        invoiceNumber: `INV-TEMP-${room.roomNumber}`,
        checkInDate: new Date().toISOString().split('T')[0]
      };
      setCheckoutModalData({ room, booking: pseudoBooking });
    }
  };

  // Global Trigger: Print Invoice by InvoiceNumber or BookingId
  const handlePrintInvoice = (identifier) => {
    const inv = invoices.find(i => i.invoiceNumber === identifier || i.bookingId === identifier);
    if (inv) {
      setPrintInvoiceData(inv);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1">
        
        {/* Top Navbar */}
        <TopNavbar 
          onMenuClick={() => setSidebarOpen(true)} 
          onLaunchCheckIn={() => handleLaunchCheckIn()}
        />

        {/* Page Outlet providing global modal openers via context or props */}
        <main className="flex-1 p-3 sm:p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{
            onOpenCheckIn: handleLaunchCheckIn,
            onOpenCheckout: handleLaunchCheckout,
            onOpenRoomDetails: (room) => setRoomDetailsModalRoom(room),
            onPrintInvoice: (inv) => {
              if (typeof inv === 'object') {
                setPrintInvoiceData(inv);
              } else {
                handlePrintInvoice(inv);
              }
            }
          }} />
        </main>
      </div>

      {/* Global Modals Mounted */}
      {checkInModalRoom && (
        <WalkInCheckInModal
          room={checkInModalRoom}
          isOpen={Boolean(checkInModalRoom)}
          onClose={() => setCheckInModalRoom(null)}
          onCheckInSuccess={(result) => {
            // Optional: offer immediate invoice print
          }}
        />
      )}

      {checkoutModalData && (
        <CheckoutModal
          room={checkoutModalData.room}
          booking={checkoutModalData.booking}
          isOpen={Boolean(checkoutModalData)}
          onClose={() => setCheckoutModalData(null)}
          onPrintInvoice={(invNo) => handlePrintInvoice(invNo)}
        />
      )}

      {roomDetailsModalRoom && (
        <RoomDetailsModal
          room={roomDetailsModalRoom}
          isOpen={Boolean(roomDetailsModalRoom)}
          onClose={() => setRoomDetailsModalRoom(null)}
          onLaunchCheckIn={(room) => handleLaunchCheckIn(room)}
        />
      )}

      {printInvoiceData && (
        <PrintableInvoiceModal
          invoice={printInvoiceData}
          isOpen={Boolean(printInvoiceData)}
          onClose={() => setPrintInvoiceData(null)}
        />
      )}

    </div>
  );
}
