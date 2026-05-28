import { useState, useEffect, useRef } from 'react';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch Notifications when the component mounts
    useEffect(() => {
        fetchNotifications();
        
        // Close the dropdown if the user clicks outside of it
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('authToken');
            
            const res = await fetch('http://localhost:5001/api/user/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                // 👇 YEH LINE ADD KIJIYE 👇
                console.log("🔔 Backend se yeh data aaya:", data); 
                
                setNotifications(data);
            } else {
                console.error("Server returned an error:", res.status);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const markAsRead = async (id) => {
        // Optimistically update the UI (instant red badge removal)
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        
        try {
            const token = localStorage.getItem('authToken');
            
            // ✅ FIX 2: Added http://localhost:5001 to the URL
            await fetch(`http://localhost:5001/api/user/notifications/${id}/read`, { 
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Determine colors based on priority levels
    const getPriorityColor = (priority) => {
        if (priority === 'Emergency') return 'bg-red-50 border-red-200 text-red-800';
        if (priority === 'Urgent') return 'bg-orange-50 border-orange-200 text-orange-800';
        return 'bg-white border-gray-100 text-gray-800';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* The Bell Icon Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-[10px] font-black text-white bg-red-600 border-2 border-white rounded-full animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* The Dropdown Panel */}
            {isOpen && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-fadeIn">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-black text-gray-900">Notifications</h3>
                        <span className="bg-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full text-[10px] font-bold">
                            {unreadCount} New
                        </span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 font-medium text-sm">
                                No new notifications! 🎉
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div 
                                    key={notif.id} 
                                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                                    className={`p-4 border-b last:border-b-0 cursor-pointer transition-colors hover:brightness-95 ${getPriorityColor(notif.priority)} ${!notif.isRead ? 'opacity-100' : 'opacity-60 bg-gray-50'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-sm flex items-center gap-2">
                                            {!notif.isRead && <span className="w-2 h-2 bg-indigo-600 rounded-full inline-block"></span>}
                                            {notif.title}
                                        </h4>
                                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">
                                            {new Date(notif.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                        {notif.message}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}