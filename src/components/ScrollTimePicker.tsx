import React, { useEffect, useRef, useState } from 'react';

interface ScrollTimePickerProps {
    value: string;
    onChange: (value: string) => void;
    startTime?: string; // e.g., "10:00"
    endTime?: string;   // e.g., "22:00"
}

const ScrollTimePicker: React.FC<ScrollTimePickerProps> = ({
    value,
    onChange,
    startTime = "10:00",
    endTime = "22:00"
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);

    // Generate time slots
    useEffect(() => {
        const slots = [];
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        // Convert to minutes for easier calculation
        let currentMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        while (currentMinutes <= endMinutes) {
            const h = Math.floor(currentMinutes / 60);
            const m = currentMinutes % 60;
            const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            slots.push(timeString);
            currentMinutes += 30; // 30-minute interval
        }
        setTimeSlots(slots);
    }, [startTime, endTime]);


    return (
        <div className="relative h-40 w-full overflow-hidden bg-gray-50 rounded-xl border border-gray-200 shadow-inner group">
            {/* Selection Highlight Bar (Center) */}
            <div className="absolute top-1/2 left-0 right-0 h-10 -mt-5 bg-brand-yellow/20 border-y border-brand-yellow/50 pointer-events-none z-10"></div>

            <div
                className="h-full overflow-y-auto snap-y snap-mandatory py-[60px] custom-scrollbar scroll-smooth"
                ref={scrollContainerRef}
            >
                {timeSlots.map((time) => {
                    const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                    const isSelected = value === time;

                    return (
                        <div
                            key={time}
                            onClick={() => {
                                onChange(time);
                                // Center the clicked item
                                if (scrollContainerRef.current) {
                                    const container = scrollContainerRef.current;
                                    const item = container.children[timeSlots.indexOf(time)] as HTMLElement;
                                    container.scrollTo({
                                        top: item.offsetTop - container.offsetHeight / 2 + item.offsetHeight / 2,
                                        behavior: 'smooth'
                                    });
                                }
                            }}
                            className={`h-10 flex items-center justify-center snap-center cursor-pointer transition-all duration-200 
                                ${isSelected ? 'font-bold text-brand-dark scale-110' : 'text-gray-400 scale-90 hover:text-gray-600'}
                            `}
                        >
                            {displayTime}
                        </div>
                    );
                })}
            </div>

            {/* Gradient Masks for 3D effect */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
        </div>
    );
};

export default ScrollTimePicker;
