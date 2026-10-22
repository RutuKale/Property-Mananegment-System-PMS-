import React, { useState } from 'react';
import { 
  Building2, Plus, Edit2, Trash2, Check, X, 
  Layers, BedDouble, AlertCircle, Sparkles 
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { formatINR } from '../services/pricingCalculators';
import { isDuplicateRoomNumber } from '../services/roomService';
import { useToast } from '../context/ToastContext';

export default function RoomFloorConfigPage() {
  const { rooms, floors, addRoom, updateRoom, deleteRoom, addFloor } = useHotel();
  const { showSuccess, showError } = useToast();

  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAddFloorModal, setShowAddFloorModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // New Room Form
  const [newRoomData, setNewRoomData] = useState({
    roomNumber: '',
    floorId: floors[0]?.floorId || 'fl-g',
    category: 'Standard Deluxe',
    bedType: 'King Bed',
    pricePerNight: 2800,
    amenities: 'High-speed WiFi, King Bed, Smart TV, Garden View'
  });

  // New Floor Form
  const [newFloorData, setNewFloorData] = useState({
    floorNumber: floors.length,
    name: `${floors.length}th Floor`,
    description: 'Luxury guest rooms and lounge'
  });

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!newRoomData.roomNumber.trim()) {
      showError("Please enter a valid room number.");
      return;
    }

    if (isDuplicateRoomNumber(newRoomData.roomNumber, rooms)) {
      showError(`Room ${newRoomData.roomNumber} already exists in inventory! Duplicate numbers rejected.`);
      return;
    }

    addRoom({
      ...newRoomData,
      amenities: newRoomData.amenities.split(',').map(s => s.trim()).filter(Boolean)
    });

    showSuccess(`Room ${newRoomData.roomNumber} added to master inventory.`);
    setShowAddRoomModal(false);
    setNewRoomData({
      roomNumber: '',
      floorId: floors[0]?.floorId || 'fl-g',
      category: 'Standard Deluxe',
      bedType: 'King Bed',
      pricePerNight: 2800,
      amenities: 'High-speed WiFi, King Bed, Smart TV'
    });
  };

  const handleSaveEditRoom = (e) => {
    e.preventDefault();
    if (isDuplicateRoomNumber(editingRoom.roomNumber, rooms, editingRoom.roomId)) {
      showError(`Room ${editingRoom.roomNumber} conflicts with another existing room!`);
      return;
    }

    updateRoom(editingRoom.roomId, {
      ...editingRoom,
      pricePerNight: Number(editingRoom.pricePerNight) || 2000
    });

    showSuccess(`Room ${editingRoom.roomNumber} configuration updated.`);
    setEditingRoom(null);
  };

  const handleCreateFloor = (e) => {
    e.preventDefault();
    addFloor(newFloorData);
    showSuccess(`Floor ${newFloorData.name} created.`);
    setShowAddFloorModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 font-display">
            Room & Floor Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Master inventory management: Configure room tariffs, bed categories, and floors.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => setShowAddFloorModal(true)}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Layers className="w-4 h-4" /> Add Floor
          </button>
          <button
            onClick={() => setShowAddRoomModal(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Room
          </button>
        </div>
      </div>

      {/* Floors Overview List */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {floors.map(f => {
          const roomCount = rooms.filter(r => r.floorId === f.floorId).length;
          return (
            <div key={f.floorId} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold text-slate-400">{f.floorNumber}F</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                  {roomCount} Rooms
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-1">{f.name}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{f.description || 'Guest rooms'}</p>
            </div>
          );
        })}
      </div>

      {/* Rooms Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            All Room Units ({rooms.length} Total)
          </h3>
          <span className="text-xs text-slate-400">Natural sorting order applied</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-3 px-4">Room #</th>
                <th className="py-3 px-4">Floor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Bed Type</th>
                <th className="py-3 px-4">Nightly Tariff</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map(room => {
                const floorObj = floors.find(f => f.floorId === room.floorId);
                return (
                  <tr key={room.roomId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {room.roomNumber}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {floorObj?.name || 'Floor'}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {room.category}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {room.bedType || 'King Bed'}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {formatINR(room.pricePerNight)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {room.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingRoom({ ...room })}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                          title="Edit Room"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete Room ${room.roomNumber} permanently?`)) {
                              deleteRoom(room.roomId);
                              showSuccess(`Room ${room.roomNumber} removed.`);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                          title="Delete Room"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add New Room Unit</h3>
              <button onClick={() => setShowAddRoomModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room # *</label>
                  <input
                    type="text"
                    required
                    value={newRoomData.roomNumber}
                    onChange={(e) => setNewRoomData({ ...newRoomData, roomNumber: e.target.value })}
                    placeholder="e.g. 501"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Floor *</label>
                  <select
                    value={newRoomData.floorId}
                    onChange={(e) => setNewRoomData({ ...newRoomData, floorId: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {floors.map(f => (
                      <option key={f.floorId} value={f.floorId}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room Category</label>
                <select
                  value={newRoomData.category}
                  onChange={(e) => setNewRoomData({ ...newRoomData, category: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Standard Deluxe">Standard Deluxe</option>
                  <option value="Executive Suite">Executive Suite</option>
                  <option value="Royal Panorama Suite">Royal Panorama Suite</option>
                  <option value="Imperial Penthouse Suite">Imperial Penthouse Suite</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bed Type</label>
                  <input
                    type="text"
                    value={newRoomData.bedType}
                    onChange={(e) => setNewRoomData({ ...newRoomData, bedType: e.target.value })}
                    placeholder="King Bed / Twin"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tariff Per Night (₹)</label>
                  <input
                    type="number"
                    min="500"
                    required
                    value={newRoomData.pricePerNight}
                    onChange={(e) => setNewRoomData({ ...newRoomData, pricePerNight: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amenities (Comma separated)</label>
                <input
                  type="text"
                  value={newRoomData.amenities}
                  onChange={(e) => setNewRoomData({ ...newRoomData, amenities: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Create Room Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit Room {editingRoom.roomNumber}</h3>
              <button onClick={() => setEditingRoom(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveEditRoom} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room #</label>
                <input
                  type="text"
                  required
                  value={editingRoom.roomNumber}
                  onChange={(e) => setEditingRoom({ ...editingRoom, roomNumber: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editingRoom.category}
                  onChange={(e) => setEditingRoom({ ...editingRoom, category: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tariff Per Night (₹)</label>
                <input
                  type="number"
                  min="500"
                  required
                  value={editingRoom.pricePerNight}
                  onChange={(e) => setEditingRoom({ ...editingRoom, pricePerNight: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Floor Modal */}
      {showAddFloorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add Property Floor</h3>
              <button onClick={() => setShowAddFloorModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateFloor} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Floor Number</label>
                <input
                  type="number"
                  required
                  value={newFloorData.floorNumber}
                  onChange={(e) => setNewFloorData({ ...newFloorData, floorNumber: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Floor Name</label>
                <input
                  type="text"
                  required
                  value={newFloorData.name}
                  onChange={(e) => setNewFloorData({ ...newFloorData, name: e.target.value })}
                  placeholder="e.g. 4th Floor"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newFloorData.description}
                  onChange={(e) => setNewFloorData({ ...newFloorData, description: e.target.value })}
                  placeholder="Floor wing notes"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFloorModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Add Floor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
