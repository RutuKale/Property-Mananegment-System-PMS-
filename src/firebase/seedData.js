export const INITIAL_HOTEL_SETTINGS = {
  hotelId: "UR-STAY-MAIN",
  name: "UR Stay Luxury Hotels & Resorts",
  tradeName: "UR Stay Palace & Suites",
  tagline: "Uncompromised Opulence & Timeless Hospitality",
  gstin: "07AAAAA0000A1Z5",
  sacCode: "996311",
  taxRatePercent: 12, // 6% CGST + 6% SGST
  cgstRatePercent: 6,
  sgstRatePercent: 6,
  upiId: "urstay@icici",
  receptionPhone: "+91 98765 43210",
  receptionEmail: "concierge@urstayluxury.com",
  address: "104, Royalty Enclave, Heritage Boulevard, New Delhi 110001, India",
  currency: "INR",
  currencySymbol: "₹",
  checkInTime: "12:00 PM",
  checkOutTime: "11:00 AM"
};

export const INITIAL_FLOORS = [
  { floorId: "fl-g", floorNumber: 0, name: "Ground Floor", description: "Garden View Suites & Easy Access Deluxe Rooms" },
  { floorId: "fl-1", floorNumber: 1, name: "1st Floor", description: "Executive Club Rooms & Business Lounge" },
  { floorId: "fl-2", floorNumber: 2, name: "2nd Floor", description: "Royal Panorama Suites & Spa Balconies" },
  { floorId: "fl-3", floorNumber: 3, name: "3rd Floor", description: "Imperial Penthouse Suites & Private Jacuzzis" }
];

export const INITIAL_ROOMS = [
  // Ground Floor
  {
    roomId: "rm-101",
    floorId: "fl-g",
    roomNumber: "101",
    category: "Standard Deluxe",
    bedType: "King Bed",
    pricePerNight: 2400,
    status: "available",
    amenities: ["High-speed WiFi", "King Bed", "Garden View", "Espresso Machine", "Smart TV"],
    activeBookingId: null
  },
  {
    roomId: "rm-102",
    floorId: "fl-g",
    roomNumber: "102",
    category: "Standard Deluxe",
    bedType: "Queen Double",
    pricePerNight: 2200,
    status: "occupied",
    amenities: ["High-speed WiFi", "Twin Beds", "Garden View", "Mini Bar"],
    activeBookingId: "bk-1002"
  },
  {
    roomId: "rm-103",
    floorId: "fl-g",
    roomNumber: "103",
    category: "Executive Suite",
    bedType: "King Bed",
    pricePerNight: 3800,
    status: "checkout_due",
    amenities: ["Lounge Area", "Bath Tub", "High-speed WiFi", "Smart TV", "Work Desk"],
    activeBookingId: "bk-1003"
  },
  {
    roomId: "rm-104",
    floorId: "fl-g",
    roomNumber: "104",
    category: "Standard Deluxe",
    bedType: "King Bed",
    pricePerNight: 2400,
    status: "cleaning",
    amenities: ["High-speed WiFi", "King Bed", "Rain Shower"],
    activeBookingId: null
  },

  // 1st Floor
  {
    roomId: "rm-201",
    floorId: "fl-1",
    roomNumber: "201",
    category: "Executive Suite",
    bedType: "King Bed",
    pricePerNight: 4200,
    status: "available",
    amenities: ["High-speed WiFi", "Balcony", "Club Access", "Espresso Machine"],
    activeBookingId: null
  },
  {
    roomId: "rm-202",
    floorId: "fl-1",
    roomNumber: "202",
    category: "Executive Suite",
    bedType: "King Bed",
    pricePerNight: 4200,
    status: "occupied",
    amenities: ["High-speed WiFi", "Balcony", "Club Access", "Jacuzzi Shower"],
    activeBookingId: "bk-1004"
  },
  {
    roomId: "rm-203",
    floorId: "fl-1",
    roomNumber: "203",
    category: "Standard Deluxe",
    bedType: "Twin Bed",
    pricePerNight: 2800,
    status: "reserved",
    amenities: ["High-speed WiFi", "Twin Bed", "City View"],
    activeBookingId: "bk-1005"
  },
  {
    roomId: "rm-204",
    floorId: "fl-1",
    roomNumber: "204",
    category: "Standard Deluxe",
    bedType: "King Bed",
    pricePerNight: 2800,
    status: "maintenance",
    amenities: ["High-speed WiFi", "King Bed"],
    activeBookingId: null,
    maintenanceNotes: "HVAC air conditioner cooling coil servicing in progress."
  },

  // 2nd Floor
  {
    roomId: "rm-301",
    floorId: "fl-2",
    roomNumber: "301",
    category: "Royal Panorama Suite",
    bedType: "Grand Emperor Bed",
    pricePerNight: 6500,
    status: "occupied",
    amenities: ["Panoramic Skyline", "Private Bar", "Butler Service", "Deep Soak Tub"],
    activeBookingId: "bk-1006"
  },
  {
    roomId: "rm-302",
    floorId: "fl-2",
    roomNumber: "302",
    category: "Royal Panorama Suite",
    bedType: "Grand Emperor Bed",
    pricePerNight: 6500,
    status: "available",
    amenities: ["Panoramic Skyline", "Private Bar", "Balcony", "Smart Control iPad"],
    activeBookingId: null
  },
  {
    roomId: "rm-303",
    floorId: "fl-2",
    roomNumber: "303",
    category: "Executive Suite",
    bedType: "King Bed",
    pricePerNight: 4500,
    status: "cleaning",
    amenities: ["High-speed WiFi", "Bath Tub", "Lounge Area"],
    activeBookingId: null
  },
  {
    roomId: "rm-304",
    floorId: "fl-2",
    roomNumber: "304",
    category: "Executive Suite",
    bedType: "King Bed",
    pricePerNight: 4500,
    status: "available",
    amenities: ["High-speed WiFi", "Work Desk", "Balcony"],
    activeBookingId: null
  },

  // 3rd Floor - Imperial Penthouses
  {
    roomId: "rm-401",
    floorId: "fl-3",
    roomNumber: "401",
    category: "Imperial Penthouse Suite",
    bedType: "Custom Velvet Emperor",
    pricePerNight: 12500,
    status: "available",
    amenities: ["Private Rooftop Jacuzzi", "24/7 Dedicated Butler", "Bespoke Wine Cellar", "Helipad Access"],
    activeBookingId: null
  },
  {
    roomId: "rm-402",
    floorId: "fl-3",
    roomNumber: "402",
    category: "Imperial Penthouse Suite",
    bedType: "Custom Velvet Emperor",
    pricePerNight: 12500,
    status: "occupied",
    amenities: ["Private Rooftop Jacuzzi", "Dedicated Butler", "Home Theatre System", "Sky Garden Terrace"],
    activeBookingId: "bk-1007"
  }
];

export const INITIAL_GUESTS = [
  {
    guestId: "gst-101",
    name: "Arjun Verma",
    phone: "+91 98765 11223",
    whatsappNumber: "+91 98765 11223",
    email: "arjun.verma@example.com",
    address: "B-42, Defence Colony, New Delhi",
    documentType: "Aadhaar",
    documentNumber: "XXXXXXXX4829", // Masked storage
    createdDate: "2026-10-21"
  },
  {
    guestId: "gst-102",
    name: "Priya Sharma",
    phone: "+91 98200 44556",
    whatsappNumber: "+91 98200 44556",
    email: "priya.sharma@example.com",
    address: "12, Marine Drive, Mumbai",
    documentType: "Passport",
    documentNumber: "Z9482103",
    createdDate: "2026-10-21"
  },
  {
    guestId: "gst-103",
    name: "Rohan Singhal",
    phone: "+91 97110 99887",
    whatsappNumber: "+91 97110 99887",
    email: "rohan.s@techcorp.in",
    address: "Sector 54, Golf Course Road, Gurugram",
    documentType: "Driving Licence",
    documentNumber: "DL-04201800987",
    createdDate: "2026-10-20"
  },
  {
    guestId: "gst-104",
    name: "Dr. Meenakshi Iyer",
    phone: "+91 94440 22334",
    whatsappNumber: "+91 94440 22334",
    email: "dr.iyer@healthnet.org",
    address: "Alwarpet, Chennai, Tamil Nadu",
    documentType: "PAN Card",
    documentNumber: "ABCDE1234F",
    createdDate: "2026-10-19"
  },
  {
    guestId: "gst-105",
    name: "Vikram Singhania",
    phone: "+91 98310 77665",
    whatsappNumber: "+91 98310 77665",
    email: "singhania.v@industrial.com",
    address: "Ballygunge Circular Road, Kolkata",
    documentType: "Passport",
    documentNumber: "U1847291",
    createdDate: "2026-10-21"
  }
];

export const INITIAL_BOOKINGS = [
  {
    bookingId: "BK-2026-1002",
    id: "bk-1002",
    roomId: "rm-102",
    roomNumber: "102",
    floorName: "Ground Floor",
    category: "Standard Deluxe",
    guestId: "gst-101",
    guestName: "Arjun Verma",
    guestPhone: "+91 98765 11223",
    adults: 2,
    children: 0,
    checkInDate: "2026-10-21",
    expectedCheckoutDate: "2026-10-23",
    actualCheckoutDate: null,
    nights: 2,
    ratePerNight: 2200,
    baseCharge: 4400,
    extraGuestSurcharge: 0,
    discountAmount: 0,
    incidentalsAmount: 0,
    subtotal: 4400,
    cgstAmount: 264, // 6%
    sgstAmount: 264, // 6%
    totalTax: 528, // 12%
    totalAmount: 4928,
    amountPaid: 4928,
    balanceDue: 0,
    status: "checked_in",
    invoiceNumber: "INV-2026-1002",
    keycardReturned: false,
    createdAt: "2026-10-21T12:15:00"
  },
  {
    bookingId: "BK-2026-1003",
    id: "bk-1003",
    roomId: "rm-103",
    roomNumber: "103",
    floorName: "Ground Floor",
    category: "Executive Suite",
    guestId: "gst-102",
    guestName: "Priya Sharma",
    guestPhone: "+91 98200 44556",
    adults: 1,
    children: 0,
    checkInDate: "2026-10-20",
    expectedCheckoutDate: "2026-10-22",
    actualCheckoutDate: null,
    nights: 2,
    ratePerNight: 3800,
    baseCharge: 7600,
    extraGuestSurcharge: 0,
    discountAmount: 400,
    incidentalsAmount: 650, // Laundry
    subtotal: 7850,
    cgstAmount: 471,
    sgstAmount: 471,
    totalTax: 942,
    totalAmount: 8792,
    amountPaid: 5000,
    balanceDue: 3792, // Outstanding at checkout
    status: "checkout_due",
    invoiceNumber: "INV-2026-1003",
    keycardReturned: false,
    createdAt: "2026-10-20T14:30:00"
  },
  {
    bookingId: "BK-2026-1004",
    id: "bk-1004",
    roomId: "rm-202",
    roomNumber: "202",
    floorName: "1st Floor",
    category: "Executive Suite",
    guestId: "gst-103",
    guestName: "Rohan Singhal",
    guestPhone: "+91 97110 99887",
    adults: 2,
    children: 1,
    checkInDate: "2026-10-21",
    expectedCheckoutDate: "2026-10-24",
    nights: 3,
    ratePerNight: 4200,
    baseCharge: 12600,
    extraGuestSurcharge: 1500,
    discountAmount: 0,
    incidentalsAmount: 850, // Dining
    subtotal: 14950,
    cgstAmount: 897,
    sgstAmount: 897,
    totalTax: 1794,
    totalAmount: 16744,
    amountPaid: 10000,
    balanceDue: 6744,
    status: "checked_in",
    invoiceNumber: "INV-2026-1004",
    keycardReturned: false,
    createdAt: "2026-10-21T11:00:00"
  },
  {
    bookingId: "BK-2026-1005",
    id: "bk-1005",
    roomId: "rm-203",
    roomNumber: "203",
    floorName: "1st Floor",
    category: "Standard Deluxe",
    guestId: "gst-104",
    guestName: "Dr. Meenakshi Iyer",
    guestPhone: "+91 94440 22334",
    adults: 1,
    children: 0,
    checkInDate: "2026-10-23",
    expectedCheckoutDate: "2026-10-25",
    nights: 2,
    ratePerNight: 2800,
    baseCharge: 5600,
    extraGuestSurcharge: 0,
    discountAmount: 0,
    incidentalsAmount: 0,
    subtotal: 5600,
    cgstAmount: 336,
    sgstAmount: 336,
    totalTax: 672,
    totalAmount: 6272,
    amountPaid: 2000,
    balanceDue: 4272,
    status: "reserved",
    invoiceNumber: "INV-2026-1005",
    keycardReturned: false,
    createdAt: "2026-10-21T16:00:00"
  },
  {
    bookingId: "BK-2026-1007",
    id: "bk-1007",
    roomId: "rm-402",
    roomNumber: "402",
    floorName: "3rd Floor",
    category: "Imperial Penthouse Suite",
    guestId: "gst-105",
    guestName: "Vikram Singhania",
    guestPhone: "+91 98310 77665",
    adults: 2,
    children: 0,
    checkInDate: "2026-10-21",
    expectedCheckoutDate: "2026-10-25",
    nights: 4,
    ratePerNight: 12500,
    baseCharge: 50000,
    extraGuestSurcharge: 0,
    discountAmount: 2500,
    incidentalsAmount: 4200, // Champagne & Private Chef
    subtotal: 51700,
    cgstAmount: 3102,
    sgstAmount: 3102,
    totalTax: 6204,
    totalAmount: 57904,
    amountPaid: 57904,
    balanceDue: 0,
    status: "checked_in",
    invoiceNumber: "INV-2026-1007",
    keycardReturned: false,
    createdAt: "2026-10-21T09:30:00"
  }
];

export const INITIAL_INVOICES = [
  {
    invoiceNumber: "INV-2026-1002",
    bookingId: "BK-2026-1002",
    roomId: "rm-102",
    roomNumber: "102",
    guestName: "Arjun Verma",
    guestPhone: "+91 98765 11223",
    gstin: "07AAAAA0000A1Z5",
    sacCode: "996311",
    nights: 2,
    taxableAmount: 4400,
    cgstAmount: 264,
    sgstAmount: 264,
    taxAmount: 528,
    totalAmount: 4928,
    amountPaid: 4928,
    balanceDue: 0,
    paymentMethod: "UPI QR",
    generatedAt: "2026-10-21T12:15:00"
  },
  {
    invoiceNumber: "INV-2026-1003",
    bookingId: "BK-2026-1003",
    roomId: "rm-103",
    roomNumber: "103",
    guestName: "Priya Sharma",
    guestPhone: "+91 98200 44556",
    gstin: "07AAAAA0000A1Z5",
    sacCode: "996311",
    nights: 2,
    taxableAmount: 7850,
    cgstAmount: 471,
    sgstAmount: 471,
    taxAmount: 942,
    totalAmount: 8792,
    amountPaid: 5000,
    balanceDue: 3792,
    paymentMethod: "Razorpay",
    generatedAt: "2026-10-20T14:30:00"
  },
  {
    invoiceNumber: "INV-2026-1004",
    bookingId: "BK-2026-1004",
    roomId: "rm-202",
    roomNumber: "202",
    guestName: "Rohan Singhal",
    guestPhone: "+91 97110 99887",
    gstin: "07AAAAA0000A1Z5",
    sacCode: "996311",
    nights: 3,
    taxableAmount: 14950,
    cgstAmount: 897,
    sgstAmount: 897,
    taxAmount: 1794,
    totalAmount: 16744,
    amountPaid: 10000,
    balanceDue: 6744,
    paymentMethod: "Card POS",
    generatedAt: "2026-10-21T11:00:00"
  },
  {
    invoiceNumber: "INV-2026-1007",
    bookingId: "BK-2026-1007",
    roomId: "rm-402",
    roomNumber: "402",
    guestName: "Vikram Singhania",
    guestPhone: "+91 98310 77665",
    gstin: "07AAAAA0000A1Z5",
    sacCode: "996311",
    nights: 4,
    taxableAmount: 51700,
    cgstAmount: 3102,
    sgstAmount: 3102,
    taxAmount: 6204,
    totalAmount: 57904,
    amountPaid: 57904,
    balanceDue: 0,
    paymentMethod: "Razorpay",
    generatedAt: "2026-10-21T09:30:00"
  }
];

export const INITIAL_PAYMENTS = [
  {
    transactionId: "TXN-2026-78901",
    bookingId: "BK-2026-1002",
    roomId: "rm-102",
    guestName: "Arjun Verma",
    amount: 4928,
    paymentMethod: "UPI QR",
    paymentType: "Full Settlement",
    referenceId: "UPI/20261021/987129",
    timestamp: "2026-10-21T12:15:30",
    status: "Completed"
  },
  {
    transactionId: "TXN-2026-78902",
    bookingId: "BK-2026-1003",
    roomId: "rm-103",
    guestName: "Priya Sharma",
    amount: 5000,
    paymentMethod: "Razorpay",
    paymentType: "Advance Deposit",
    referenceId: "pay_RozP9482103",
    timestamp: "2026-10-20T14:32:10",
    status: "Completed"
  },
  {
    transactionId: "TXN-2026-78903",
    bookingId: "BK-2026-1004",
    roomId: "rm-202",
    guestName: "Rohan Singhal",
    amount: 10000,
    paymentMethod: "Card POS",
    paymentType: "Advance Deposit",
    referenceId: "HDFC-POS-8849",
    timestamp: "2026-10-21T11:05:00",
    status: "Completed"
  },
  {
    transactionId: "TXN-2026-78904",
    bookingId: "BK-2026-1007",
    roomId: "rm-402",
    guestName: "Vikram Singhania",
    amount: 57904,
    paymentMethod: "Razorpay",
    paymentType: "Full Settlement",
    referenceId: "pay_RozP9982410",
    timestamp: "2026-10-21T09:34:00",
    status: "Completed"
  }
];

export const INITIAL_HOUSEKEEPING_TASKS = [
  {
    taskId: "hk-101",
    roomId: "rm-104",
    roomNumber: "104",
    taskType: "Deep Sanitization",
    priority: "High",
    status: "in_progress",
    assignedTo: "Ramesh Kumar",
    createdAt: "2026-10-22T08:00:00",
    checklist: [
      { item: "Linen change & hospital-grade ozone sterilization", completed: true },
      { item: "Minibar restock & hygiene seals", completed: true },
      { item: "Bathroom chemical sanitization & fresh towels", completed: false },
      { item: "High-touch surfaces disinfection (Remotes, Door Handles)", completed: false }
    ],
    notes: "Post-checkout sanitization protocol."
  },
  {
    taskId: "hk-102",
    roomId: "rm-303",
    roomNumber: "303",
    taskType: "Turnover Cleaning",
    priority: "Medium",
    status: "pending",
    assignedTo: "Sunita Bai",
    createdAt: "2026-10-22T09:15:00",
    checklist: [
      { item: "Bed linen replacement with 400-thread count sheets", completed: false },
      { item: "Vacuum carpets and polish wood accents", completed: false },
      { item: "Aroma diffuser refilling (Sandalwood & Jasmine)", completed: false }
    ],
    notes: "VIP guest arrival scheduled for afternoon."
  },
  {
    taskId: "hk-103",
    roomId: "rm-204",
    roomNumber: "204",
    taskType: "HVAC Maintenance",
    priority: "Urgent",
    status: "in_progress",
    assignedTo: "Mahesh Chawla (Engineering)",
    createdAt: "2026-10-21T18:00:00",
    checklist: [
      { item: "Inspect cooling refrigerant pressure", completed: true },
      { item: "Replace HEPA filter unit", completed: true },
      { item: "Thermostat calibration check", completed: false }
    ],
    notes: "HVAC unit leaking condensate onto utility drip tray."
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    notificationId: "notif-001",
    recipientPhone: "+91 98765 11223",
    recipientName: "Arjun Verma",
    messageType: "Check-in Welcome",
    messageText: "Welcome to UR Stay Luxury Hotels & Resorts, Arjun Verma! Your check-in has been confirmed. *Booking ID:* BK-2026-1002, *Room Number:* 102...",
    status: "Delivered",
    provider: "Meta WhatsApp Cloud API v19.0",
    timestamp: "2026-10-21T12:16:00",
    bookingId: "BK-2026-1002",
    roomId: "rm-102"
  },
  {
    notificationId: "notif-002",
    recipientPhone: "+91 98200 44556",
    recipientName: "Priya Sharma",
    messageType: "30-Min Checkout Reminder",
    messageText: "Dear Priya Sharma, this is a gentle reminder that your checkout from Room 103 at UR Stay is scheduled in 30 minutes (11:00 AM)...",
    status: "Delivered",
    provider: "Meta WhatsApp Cloud API v19.0",
    timestamp: "2026-10-22T10:30:00",
    bookingId: "BK-2026-1003",
    roomId: "rm-103"
  },
  {
    notificationId: "notif-003",
    recipientPhone: "+91 98310 77665",
    recipientName: "Vikram Singhania",
    messageType: "Check-in Welcome",
    messageText: "Welcome to UR Stay Luxury Hotels & Resorts, Vikram Singhania! Your check-in to Imperial Penthouse Suite 402 has been confirmed...",
    status: "Delivered",
    provider: "Meta WhatsApp Cloud API v19.0",
    timestamp: "2026-10-21T09:35:00",
    bookingId: "BK-2026-1007",
    roomId: "rm-402"
  }
];

export const INITIAL_USERS = [
  {
    uid: "usr-admin",
    name: "Vikramaditya Rathore",
    email: "admin@urstayluxury.com",
    role: "Admin",
    designation: "General Manager & Property Director",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    uid: "usr-manager",
    name: "Ananya Roy",
    email: "ananya.manager@urstayluxury.com",
    role: "Manager",
    designation: "Front Office Operations Head",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  },
  {
    uid: "usr-reception",
    name: "Rahul Sen",
    email: "reception@urstayluxury.com",
    role: "Receptionist",
    designation: "Senior Concierge & Front Desk Executive",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    uid: "usr-housekeeping",
    name: "Ramesh Kumar",
    email: "housekeeping@urstayluxury.com",
    role: "Housekeeping",
    designation: "Executive Housekeeper & Floor Captain",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    logId: "audit-101",
    action: "SYSTEM_INITIALIZED",
    performedBy: "Vikramaditya Rathore (Admin)",
    details: "UR Stay Luxury PMS v1.0.0 initialized with 11 normalized collections.",
    timestamp: "2026-10-21T08:00:00"
  },
  {
    logId: "audit-102",
    action: "CHECKIN_PROCESSED",
    performedBy: "Rahul Sen (Receptionist)",
    details: "Atomic check-in completed for Room 102 (Arjun Verma). Invoice INV-2026-1002 generated.",
    timestamp: "2026-10-21T12:15:00"
  },
  {
    logId: "audit-103",
    action: "INCIDENTALS_POSTED",
    performedBy: "Rahul Sen (Receptionist)",
    details: "Posted laundry service incidental ₹650 to Room 103 (Priya Sharma).",
    timestamp: "2026-10-21T17:40:00"
  },
  {
    logId: "audit-104",
    action: "MAINTENANCE_TRIGGERED",
    performedBy: "Ramesh Kumar (Housekeeping)",
    details: "Room 204 moved to Maintenance due to HVAC condensation leak.",
    timestamp: "2026-10-21T18:00:00"
  }
];
