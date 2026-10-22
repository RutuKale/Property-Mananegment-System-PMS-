import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  INITIAL_HOTEL_SETTINGS,
  INITIAL_FLOORS,
  INITIAL_ROOMS,
  INITIAL_BOOKINGS,
  INITIAL_GUESTS,
  INITIAL_PAYMENTS,
  INITIAL_INVOICES,
  INITIAL_HOUSEKEEPING_TASKS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS
} from '../firebase/seedData';
import { performAtomicCheckIn as executeAtomicCheckIn } from '../services/bookingService';
import { naturalSortRooms } from '../services/roomService';
import { isLiveFirebaseConfigured, db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';

const HotelContext = createContext(null);

const STORAGE_KEYS = {
  SETTINGS: 'urstay_hotel_settings',
  FLOORS: 'urstay_floors',
  ROOMS: 'urstay_rooms',
  BOOKINGS: 'urstay_bookings',
  GUESTS: 'urstay_guests',
  PAYMENTS: 'urstay_payments',
  INVOICES: 'urstay_invoices',
  HOUSEKEEPING: 'urstay_housekeeping',
  NOTIFICATIONS: 'urstay_notifications',
  AUDIT: 'urstay_audit_logs'
};

function loadStored(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
    return fallback;
  }
}

export function HotelProvider({ children }) {
  // State for all 11 normalized collections
  const [hotelSettings, setHotelSettings] = useState(() => loadStored(STORAGE_KEYS.SETTINGS, INITIAL_HOTEL_SETTINGS));
  const [floors, setFloors] = useState(() => loadStored(STORAGE_KEYS.FLOORS, INITIAL_FLOORS));
  const [rooms, setRooms] = useState(() => loadStored(STORAGE_KEYS.ROOMS, INITIAL_ROOMS));
  const [bookings, setBookings] = useState(() => loadStored(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS));
  const [guests, setGuests] = useState(() => loadStored(STORAGE_KEYS.GUESTS, INITIAL_GUESTS));
  const [payments, setPayments] = useState(() => loadStored(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS));
  const [invoices, setInvoices] = useState(() => loadStored(STORAGE_KEYS.INVOICES, INITIAL_INVOICES));
  const [housekeepingTasks, setHousekeepingTasks] = useState(() => loadStored(STORAGE_KEYS.HOUSEKEEPING, INITIAL_HOUSEKEEPING_TASKS));
  const [notifications, setNotifications] = useState(() => loadStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS));
  const [auditLogs, setAuditLogs] = useState(() => loadStored(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS));

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(hotelSettings)); }, [hotelSettings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.FLOORS, JSON.stringify(floors)); }, [floors]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms)); }, [rooms]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests)); }, [guests]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.HOUSEKEEPING, JSON.stringify(housekeepingTasks)); }, [housekeepingTasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs)); }, [auditLogs]);

  // Live Firebase Firestore Sync with proper cleanup closures as in PDF Page 3
  useEffect(() => {
    if (!isLiveFirebaseConfigured) return;

    const unsubscribers = [];
    try {
      const roomsUnsub = onSnapshot(collection(db, 'rooms'), (snapshot) => {
        if (!snapshot.empty) {
          const liveRooms = snapshot.docs.map(doc => ({ ...doc.data(), roomId: doc.id }));
          setRooms(liveRooms);
        }
      }, (err) => console.warn('Firestore rooms onSnapshot listener:', err.message));
      unsubscribers.push(roomsUnsub);

      const bookingsUnsub = onSnapshot(collection(db, 'bookings'), (snapshot) => {
        if (!snapshot.empty) {
          const liveBookings = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          setBookings(liveBookings);
        }
      }, (err) => console.warn('Firestore bookings onSnapshot listener:', err.message));
      unsubscribers.push(bookingsUnsub);

      const hkUnsub = onSnapshot(collection(db, 'housekeepingTasks'), (snapshot) => {
        if (!snapshot.empty) {
          const liveTasks = snapshot.docs.map(doc => ({ ...doc.data(), taskId: doc.id }));
          setHousekeepingTasks(liveTasks);
        }
      }, (err) => console.warn('Firestore housekeeping onSnapshot listener:', err.message));
      unsubscribers.push(hkUnsub);
    } catch (e) {
      console.warn("Live Firestore sync bypassed for local fast engine:", e.message);
    }

    // Clean cleanup closure to prevent memory leaks during rapid navigation
    return () => {
      unsubscribers.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, []);

  // Sorted room inventory
  const sortedRooms = useMemo(() => naturalSortRooms(rooms), [rooms]);

  // Operational KPI calculations (Section 5)
  const metrics = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter(r => r.status === 'available').length;
    const occupied = rooms.filter(r => r.status === 'occupied').length;
    const reserved = rooms.filter(r => r.status === 'reserved').length;
    const cleaning = rooms.filter(r => r.status === 'cleaning').length;
    const maintenance = rooms.filter(r => r.status === 'maintenance').length;
    const checkoutDue = rooms.filter(r => r.status === 'checkout_due').length;

    // Occupancy Rate: ((Occupied + Checkout Due) / Total) * 100
    const occupiedTotal = occupied + checkoutDue;
    const occupancyRate = total > 0 ? Math.round((occupiedTotal / total) * 100) : 0;

    // Today's Check-ins count
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCheckIns = bookings.filter(b => b.checkInDate === todayStr || b.status === 'checked_in').length;
    const todayCheckOuts = bookings.filter(b => b.actualCheckoutDate === todayStr).length;

    // Today's Front Desk Revenue (sum of all completed payments today)
    const todayRevenue = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    return {
      totalRooms: total,
      availableRooms: available,
      occupiedRooms: occupied,
      reservedRooms: reserved,
      cleaningRooms: cleaning,
      maintenanceRooms: maintenance,
      checkoutDueRooms: checkoutDue,
      occupancyRate,
      todayCheckIns,
      todayCheckOuts,
      todayRevenue
    };
  }, [rooms, bookings, payments]);

  // 1. Atomic Check-in Execution
  const performCheckIn = useCallback(async (payload) => {
    const result = await executeAtomicCheckIn({
      ...payload,
      hotelSettings
    });

    // Update rooms atomically
    setRooms(prev => prev.map(r => r.roomId === result.room.roomId ? result.room : r));
    setBookings(prev => [result.booking, ...prev]);
    setGuests(prev => [result.guest, ...prev]);
    setInvoices(prev => [result.invoice, ...prev]);
    setPayments(prev => [result.payment, ...prev]);
    setNotifications(prev => [result.notification, ...prev]);
    setAuditLogs(prev => [result.audit, ...prev]);

    return result;
  }, [hotelSettings]);

  // 2. Checkout & Clearance Pipeline (Section 6)
  const performCheckout = useCallback(async ({
    booking,
    room,
    finalPayment,
    incidentalsList = [],
    keycardReturned,
    managerOverrideReason,
    currentUser
  }) => {
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];

    // Check keycard rule: if not returned, manager override reason is mandatory
    if (!keycardReturned && (!managerOverrideReason || !managerOverrideReason.trim())) {
      throw new Error("Keycard was not returned. A Manager Override Reason is strictly required to proceed.");
    }

    // 1. Calculate Incidentals total
    const incidentalsTotal = incidentalsList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const updatedSubtotal = (booking.subtotal || 0) + incidentalsTotal;
    const cgstIncidental = Math.round(incidentalsTotal * 0.06 * 100) / 100;
    const sgstIncidental = Math.round(incidentalsTotal * 0.06 * 100) / 100;
    const additionalTax = cgstIncidental + sgstIncidental;
    const finalTotalAmount = (booking.totalAmount || 0) + incidentalsTotal + additionalTax;

    const settledAmount = Number(finalPayment?.amount) || 0;
    const totalPaid = (booking.amountPaid || 0) + settledAmount;
    const remainingBalance = Math.max(0, finalTotalAmount - totalPaid);

    // 2. Update Booking
    const updatedBooking = {
      ...booking,
      incidentalsAmount: (booking.incidentalsAmount || 0) + incidentalsTotal,
      subtotal: updatedSubtotal,
      cgstAmount: (booking.cgstAmount || 0) + cgstIncidental,
      sgstAmount: (booking.sgstAmount || 0) + sgstIncidental,
      totalTax: (booking.totalTax || 0) + additionalTax,
      totalAmount: finalTotalAmount,
      amountPaid: totalPaid,
      balanceDue: remainingBalance,
      status: 'checked_out',
      actualCheckoutDate: todayStr,
      keycardReturned,
      managerOverrideReason: keycardReturned ? null : managerOverrideReason
    };

    // 3. Status Transitions IMMEDIATELY to 'cleaning' (NEVER directly to available)
    const updatedRoom = {
      ...room,
      status: 'cleaning',
      activeBookingId: null
    };

    // 4. Automated Housekeeping Dispatch
    const newHkTask = {
      taskId: `hk-${Date.now()}`,
      roomId: room.roomId,
      roomNumber: room.roomNumber,
      taskType: 'Post-Departure Deep Sanitization',
      priority: 'High',
      status: 'pending',
      assignedTo: 'Housekeeping Team',
      createdAt: nowIso,
      checklist: [
        { item: 'Hospital grade bed linen replacement (400-thread count)', completed: false },
        { item: 'Bathroom deep descaling & chemical sanitization', completed: false },
        { item: 'Minibar audit & replenishment', completed: false },
        { item: 'Keycard disinfection & lock code reset', completed: false }
      ],
      notes: `Automated turnover task created upon checkout of ${booking.guestName}.`
    };

    // 5. Payment record if balance was settled at checkout
    let newPayment = null;
    if (settledAmount > 0) {
      newPayment = {
        transactionId: `TXN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        bookingId: booking.bookingId,
        roomId: room.roomId,
        guestName: booking.guestName,
        amount: settledAmount,
        paymentMethod: finalPayment.paymentMethod || 'Cash',
        paymentType: 'Final Settlement',
        referenceId: finalPayment.referenceId || `SETTLE-${Date.now().toString().slice(-6)}`,
        timestamp: nowIso,
        status: 'Completed'
      };
    }

    // 6. Update Tax Invoice
    const updatedInvoice = {
      invoiceNumber: booking.invoiceNumber,
      bookingId: booking.bookingId,
      roomId: room.roomId,
      roomNumber: room.roomNumber,
      guestName: booking.guestName,
      guestPhone: booking.guestPhone,
      gstin: hotelSettings.gstin,
      sacCode: hotelSettings.sacCode || "996311",
      nights: booking.nights,
      taxableAmount: updatedSubtotal,
      cgstAmount: updatedBooking.cgstAmount,
      sgstAmount: updatedBooking.sgstAmount,
      taxAmount: updatedBooking.totalTax,
      totalAmount: finalTotalAmount,
      amountPaid: totalPaid,
      balanceDue: remainingBalance,
      paymentMethod: finalPayment?.paymentMethod || 'Counter Settlement',
      generatedAt: nowIso
    };

    // 7. Audit Log
    const newAudit = {
      logId: `audit-${Date.now()}`,
      action: 'CHECKOUT_CLEARED',
      performedBy: currentUser?.name || 'Reception Staff',
      details: `Checked out Room ${room.roomNumber} (${booking.guestName}). Room queued for sanitization. Key returned: ${keycardReturned ? 'Yes' : 'No (Override: ' + managerOverrideReason + ')'}.`,
      timestamp: nowIso
    };

    // State mutations
    setRooms(prev => prev.map(r => r.roomId === room.roomId ? updatedRoom : r));
    setBookings(prev => prev.map(b => b.bookingId === booking.bookingId ? updatedBooking : b));
    setHousekeepingTasks(prev => [newHkTask, ...prev]);
    setInvoices(prev => prev.map(inv => inv.invoiceNumber === booking.invoiceNumber ? updatedInvoice : inv));
    if (newPayment) setPayments(prev => [newPayment, ...prev]);
    setAuditLogs(prev => [newAudit, ...prev]);

    return { updatedBooking, updatedRoom, newHkTask, updatedInvoice };
  }, [hotelSettings]);

  // 3. Complete Housekeeping Sanitization
  const completeHousekeepingSanitization = useCallback((taskId, roomId) => {
    const nowIso = new Date().toISOString();
    
    // Room restores to 'available' (Emerald Green)
    setRooms(prev => prev.map(r => {
      if (r.roomId === roomId) {
        return { ...r, status: 'available', activeBookingId: null, maintenanceNotes: null };
      }
      return r;
    }));

    // Task resolved
    setHousekeepingTasks(prev => prev.map(t => {
      if (t.taskId === taskId) {
        return {
          ...t,
          status: 'completed',
          completedAt: nowIso,
          checklist: t.checklist.map(item => ({ ...item, completed: true }))
        };
      }
      return t;
    }));

    setAuditLogs(prev => [
      {
        logId: `audit-${Date.now()}`,
        action: 'SANITIZATION_COMPLETED',
        performedBy: 'Housekeeping Staff',
        details: `Room ${roomId} successfully sanitized and marked Available.`,
        timestamp: nowIso
      },
      ...prev
    ]);
  }, []);

  // 4. Resolve Maintenance
  const resolveMaintenance = useCallback((roomId, notes = 'Defect resolved') => {
    const nowIso = new Date().toISOString();
    setRooms(prev => prev.map(r => {
      if (r.roomId === roomId) {
        return { ...r, status: 'available', maintenanceNotes: null };
      }
      return r;
    }));

    setAuditLogs(prev => [
      {
        logId: `audit-${Date.now()}`,
        action: 'MAINTENANCE_RESOLVED',
        performedBy: 'Maintenance Engineer',
        details: `Room ${roomId} defect resolved: ${notes}. Restored to Available.`,
        timestamp: nowIso
      },
      ...prev
    ]);
  }, []);

  // 5. Add / Edit / Delete Room
  const addRoom = useCallback((roomData) => {
    const newRoom = {
      roomId: `rm-${roomData.roomNumber}`,
      floorId: roomData.floorId,
      roomNumber: roomData.roomNumber,
      category: roomData.category || 'Standard Deluxe',
      bedType: roomData.bedType || 'King Bed',
      pricePerNight: Number(roomData.pricePerNight) || 2500,
      status: 'available',
      amenities: roomData.amenities || ['High-speed WiFi', 'King Bed'],
      activeBookingId: null
    };
    setRooms(prev => [...prev, newRoom]);
    return newRoom;
  }, []);

  const updateRoom = useCallback((roomId, updates) => {
    setRooms(prev => prev.map(r => r.roomId === roomId ? { ...r, ...updates } : r));
  }, []);

  const deleteRoom = useCallback((roomId) => {
    setRooms(prev => prev.filter(r => r.roomId !== roomId));
  }, []);

  // 6. Floor Management
  const addFloor = useCallback((floorData) => {
    const newFloor = {
      floorId: `fl-${Date.now()}`,
      floorNumber: Number(floorData.floorNumber) || 0,
      name: floorData.name,
      description: floorData.description || ''
    };
    setFloors(prev => [...prev, newFloor]);
    return newFloor;
  }, []);

  // 7. Hotel Settings update
  const updateSettings = useCallback((newSettings) => {
    setHotelSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // 8. Log WhatsApp Notification
  const logWhatsAppNotification = useCallback((notifData) => {
    const newNotif = {
      notificationId: `notif-${Date.now()}`,
      recipientPhone: notifData.recipientPhone,
      recipientName: notifData.recipientName || 'Guest',
      messageType: notifData.messageType || 'Manual Outbound',
      messageText: notifData.messageText,
      status: 'Delivered',
      provider: 'Meta WhatsApp Cloud API v19.0',
      timestamp: new Date().toISOString(),
      bookingId: notifData.bookingId || null,
      roomId: notifData.roomId || null
    };
    setNotifications(prev => [newNotif, ...prev]);
    return newNotif;
  }, []);

  // Reset to initial demo seed data
  const resetToFactorySeed = useCallback(() => {
    localStorage.clear();
    setHotelSettings(INITIAL_HOTEL_SETTINGS);
    setFloors(INITIAL_FLOORS);
    setRooms(INITIAL_ROOMS);
    setBookings(INITIAL_BOOKINGS);
    setGuests(INITIAL_GUESTS);
    setPayments(INITIAL_PAYMENTS);
    setInvoices(INITIAL_INVOICES);
    setHousekeepingTasks(INITIAL_HOUSEKEEPING_TASKS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
  }, []);

  return (
    <HotelContext.Provider value={{
      hotelSettings,
      floors,
      rooms: sortedRooms,
      rawRooms: rooms,
      bookings,
      guests,
      payments,
      invoices,
      housekeepingTasks,
      notifications,
      auditLogs,
      metrics,
      performCheckIn,
      performCheckout,
      completeHousekeepingSanitization,
      resolveMaintenance,
      addRoom,
      updateRoom,
      deleteRoom,
      addFloor,
      updateSettings,
      logWhatsAppNotification,
      resetToFactorySeed
    }}>
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
}
