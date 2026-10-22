/**
 * UR Stay PMS - Room Master & Sorting Service
 */

export const ROOM_STATUSES = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
  CHECKOUT_DUE: 'checkout_due'
};

export const STATUS_METADATA = {
  available: {
    label: 'Available',
    colorKey: 'available',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-700',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    ribbonClass: 'bg-emerald-600',
    icon: 'BedDouble',
    description: 'Ready for immediate walk-in guest allocation'
  },
  occupied: {
    label: 'Occupied',
    colorKey: 'occupied',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-500',
    textClass: 'text-rose-700',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    ribbonClass: 'bg-rose-600',
    icon: 'DoorClosed',
    description: 'In-house guest actively occupying room'
  },
  reserved: {
    label: 'Reserved',
    colorKey: 'reserved',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-700',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    ribbonClass: 'bg-amber-500',
    icon: 'CalendarClock',
    description: 'Confirmed advance reservation awaiting arrival'
  },
  cleaning: {
    label: 'Cleaning',
    colorKey: 'cleaning',
    bgClass: 'bg-slate-50',
    borderClass: 'border-slate-400',
    textClass: 'text-slate-700',
    badgeClass: 'bg-slate-200 text-slate-800 border-slate-300',
    ribbonClass: 'bg-slate-500',
    icon: 'Sparkles',
    description: 'Housekeeping sanitization in progress'
  },
  maintenance: {
    label: 'Maintenance',
    colorKey: 'maintenance',
    bgClass: 'bg-zinc-100',
    borderClass: 'border-zinc-500',
    textClass: 'text-zinc-700',
    badgeClass: 'bg-zinc-200 text-zinc-800 border-zinc-400',
    ribbonClass: 'bg-zinc-600',
    icon: 'Wrench',
    description: 'Under engineering repair or defect inspection'
  },
  checkout_due: {
    label: 'Checkout Due',
    colorKey: 'checkoutdue',
    bgClass: 'bg-purple-50',
    borderClass: 'border-purple-500',
    textClass: 'text-purple-700',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    ribbonClass: 'bg-purple-600',
    icon: 'AlertCircle',
    description: 'Scheduled departure approaching (<= 35 mins)'
  }
};

/**
 * Natural room number sorting (e.g. "101", "102", "1010", "Suite A")
 */
export function naturalSortRooms(rooms = []) {
  return [...rooms].sort((a, b) => {
    return a.roomNumber.localeCompare(b.roomNumber, undefined, {
      numeric: true,
      sensitivity: 'base'
    });
  });
}

/**
 * Validates if room number already exists in room inventory
 */
export function isDuplicateRoomNumber(roomNumber, existingRooms = [], currentRoomId = null) {
  const normalized = String(roomNumber).trim().toLowerCase();
  return existingRooms.some(r => 
    String(r.roomNumber).trim().toLowerCase() === normalized && 
    r.roomId !== currentRoomId
  );
}

/**
 * Filters rooms based on status, search keyword, price ceiling, and floor
 */
export function filterRooms(rooms = [], {
  statusFilter = 'all',
  searchQuery = '',
  maxPrice = 15000,
  floorId = 'all'
}) {
  return rooms.filter(room => {
    // Status filter
    if (statusFilter !== 'all' && room.status !== statusFilter) {
      return false;
    }

    // Floor filter
    if (floorId !== 'all' && room.floorId !== floorId) {
      return false;
    }

    // Max Price
    if (room.pricePerNight > maxPrice) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = room.roomNumber.toLowerCase().includes(q);
      const matchCat = (room.category || '').toLowerCase().includes(q);
      const matchBed = (room.bedType || '').toLowerCase().includes(q);
      if (!matchNum && !matchCat && !matchBed) {
        return false;
      }
    }

    return true;
  });
}
