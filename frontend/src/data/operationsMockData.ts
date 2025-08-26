// Mock data for operations management system

export interface HotelInfo {
  id: number;
  name: string;
  address: string;
  totalRooms: number;
  floors: number;
  operationsTeam: {
    supervisor: string;
    housekeepingStaff: string[];
    maintenanceStaff: string[];
  };
}

export const HOTELS: Record<string, HotelInfo> = {
  'grandplaza': {
    id: 1,
    name: 'Grand Plaza Hotel',
    address: '123 Royal Avenue, New York',
    totalRooms: 350,
    floors: 25,
    operationsTeam: {
      supervisor: 'Michael Johnson',
      housekeepingStaff: ['Maria Lopez', 'Anna Kim', 'Sofia Garcia', 'Elena Rodriguez'],
      maintenanceStaff: ['Robert Wilson', 'James Mitchell', 'David Chen', 'Mark Taylor']
    }
  },
  'maritimegrand': {
    id: 2,
    name: 'The Maritime Grand Hotel',
    address: '1500 Ocean Boulevard, San Diego',
    totalRooms: 280,
    floors: 18,
    operationsTeam: {
      supervisor: 'David Thompson',
      housekeepingStaff: ['Lisa Chen', 'Carmen Martinez', 'Rachel Kim', 'Isabella Santos'],
      maintenanceStaff: ['Carlos Rivera', 'Daniel Brooks', 'Alex Johnson', 'Tony Garcia']
    }
  }
};

// Get current hotel based on user context (simplified)
export const getCurrentHotel = (): HotelInfo => {
  // In a real app, this would be determined by the user's hotel assignment
  // For demo, we'll use Grand Plaza as default
  return HOTELS.grandplaza;
};

export const getCurrentHotelKey = (): string => {
  // In a real app, this would be determined by the user's hotel assignment
  // For demo, we'll use Grand Plaza as default
  return 'grandplaza';
};

// Sample rooms for each hotel
export const SAMPLE_ROOMS: Record<string, string[]> = {
  grandplaza: [
    '101', '102', '103', '104', '105', '201', '202', '203', '204', '205',
    '301', '302', '303', '304', '305', '401', '402', '403', '404', '405',
    '501', '502', '503', '504', '505', '1001', '1002', '1003', '1004', '1005',
    '1501', '1502', '1503', '1504', '1505', '2001', '2002', '2003', '2004', '2005'
  ],
  maritimegrand: [
    '101', '102', '103', '104', '105', '201', '202', '203', '204', '205',
    '301', '302', '303', '304', '305', '401', '402', '403', '404', '405',
    '501', '502', '503', '504', '505', '801', '802', '803', '804', '805',
    '1201', '1202', '1203', '1204', '1205', '1501', '1502', '1503', '1504', '1505'
  ]
};

// Mock housekeeping tasks with realistic data
export const generateHousekeepingTasks = (hotelKey: string) => {
  const hotel = HOTELS[hotelKey];
  const rooms = SAMPLE_ROOMS[hotelKey];
  
  return [
    {
      id: 1,
      room: { roomNumber: rooms[0], floor: Math.floor(parseInt(rooms[0]) / 100) },
      taskType: 'ROOM_CLEANING',
      status: 'PENDING',
      priority: 'HIGH',
      description: 'Standard room cleaning - guest checkout',
      createdAt: new Date().toISOString(),
      estimatedDurationMinutes: 45,
      specialInstructions: 'Extra attention to bathroom and minibar restocking'
    },
    {
      id: 2,
      room: { roomNumber: rooms[5], floor: Math.floor(parseInt(rooms[5]) / 100) },
      taskType: 'DEEP_CLEANING',
      status: 'ASSIGNED',
      priority: 'MEDIUM',
      description: 'Deep cleaning for maintenance',
      assignedStaff: {
        id: 1,
        user: { firstName: hotel.operationsTeam.housekeepingStaff[0].split(' ')[0], lastName: hotel.operationsTeam.housekeepingStaff[0].split(' ')[1] }
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      estimatedDurationMinutes: 90,
      specialInstructions: 'Check for any damage in bathroom'
    },
    {
      id: 3,
      room: { roomNumber: rooms[10], floor: Math.floor(parseInt(rooms[10]) / 100) },
      taskType: 'ROOM_CLEANING',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      description: 'VIP guest arrival preparation',
      assignedStaff: {
        id: 2,
        user: { firstName: hotel.operationsTeam.housekeepingStaff[1].split(' ')[0], lastName: hotel.operationsTeam.housekeepingStaff[1].split(' ')[1] }
      },
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      estimatedDurationMinutes: 45,
      specialInstructions: 'VIP amenities, fresh flowers, premium linens'
    },
    {
      id: 4,
      room: { roomNumber: rooms[15], floor: Math.floor(parseInt(rooms[15]) / 100) },
      taskType: 'LAUNDRY',
      status: 'COMPLETED',
      priority: 'LOW',
      description: 'Laundry service for guest',
      assignedStaff: {
        id: 3,
        user: { firstName: hotel.operationsTeam.housekeepingStaff[2].split(' ')[0], lastName: hotel.operationsTeam.housekeepingStaff[2].split(' ')[1] }
      },
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      estimatedDurationMinutes: 30
    },
    {
      id: 5,
      room: { roomNumber: rooms[8], floor: Math.floor(parseInt(rooms[8]) / 100) },
      taskType: 'PUBLIC_AREA_CLEANING',
      status: 'PENDING',
      priority: 'MEDIUM',
      description: 'Lobby and common area cleaning',
      createdAt: new Date(Date.now() - 21600000).toISOString(),
      estimatedDurationMinutes: 60,
      specialInstructions: 'Pay attention to high-touch surfaces'
    }
  ];
};

// Mock maintenance tasks with realistic data
export const generateMaintenanceTasks = (hotelKey: string) => {
  const hotel = HOTELS[hotelKey];
  const rooms = SAMPLE_ROOMS[hotelKey];
  
  return [
    {
      id: 1,
      taskType: 'PLUMBING',
      title: 'Leaky Faucet Repair',
      description: `Bathroom faucet in room ${rooms[2]} is leaking`,
      status: 'URGENT',
      priority: 'HIGH',
      location: `Room ${rooms[2]} Bathroom`,
      equipmentType: 'Bathroom Fixtures',
      estimatedCost: 50,
      room: { roomNumber: rooms[2], floor: Math.floor(parseInt(rooms[2]) / 100) },
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      taskType: 'HVAC',
      title: 'AC Unit Maintenance',
      description: 'Routine maintenance for HVAC system',
      status: 'ASSIGNED',
      priority: 'MEDIUM',
      location: 'Building Rooftop',
      equipmentType: 'HVAC System',
      estimatedCost: 200,
      assignedStaff: {
        id: 1,
        user: { firstName: hotel.operationsTeam.maintenanceStaff[0].split(' ')[0], lastName: hotel.operationsTeam.maintenanceStaff[0].split(' ')[1] }
      },
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      taskType: 'ELECTRICAL',
      title: 'Outlet Replacement',
      description: `Replace damaged electrical outlet in room ${rooms[7]}`,
      status: 'COMPLETED',
      priority: 'MEDIUM',
      location: `Room ${rooms[7]}`,
      equipmentType: 'Electrical Outlets',
      estimatedCost: 25,
      actualCost: 30,
      assignedStaff: {
        id: 2,
        user: { firstName: hotel.operationsTeam.maintenanceStaff[1].split(' ')[0], lastName: hotel.operationsTeam.maintenanceStaff[1].split(' ')[1] }
      },
      workPerformed: 'Replaced faulty outlet and checked electrical connections',
      partsUsed: 'GFCI outlet, electrical wire',
      createdAt: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 4,
      taskType: 'APPLIANCE_REPAIR',
      title: 'Refrigerator Not Cooling',
      description: `Mini-fridge in room ${rooms[12]} not maintaining temperature`,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      location: `Room ${rooms[12]}`,
      equipmentType: 'Mini Refrigerator',
      estimatedCost: 80,
      assignedStaff: {
        id: 3,
        user: { firstName: hotel.operationsTeam.maintenanceStaff[2]?.split(' ')[0] || 'Tech', lastName: hotel.operationsTeam.maintenanceStaff[2]?.split(' ')[1] || 'Staff' }
      },
      room: { roomNumber: rooms[12], floor: Math.floor(parseInt(rooms[12]) / 100) },
      createdAt: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: 5,
      taskType: 'PREVENTIVE_MAINTENANCE',
      title: 'Elevator Monthly Inspection',
      description: 'Monthly safety and performance inspection of main elevator',
      status: 'PENDING',
      priority: 'MEDIUM',
      location: 'Main Elevator Shaft',
      equipmentType: 'Elevator System',
      estimatedCost: 150,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];
};

// Mock staff performance data
export const generateStaffPerformance = (hotelKey: string) => {
  const hotel = HOTELS[hotelKey];
  
  const performance = [];
  
  // Add operations supervisor
  performance.push({
    id: 1,
    name: hotel.operationsTeam.supervisor,
    role: 'Operations Supervisor',
    tasksCompleted: 15,
    averageRating: 4.9,
    efficiency: 98
  });
  
  // Add housekeeping staff
  hotel.operationsTeam.housekeepingStaff.forEach((name, index) => {
    performance.push({
      id: performance.length + 1,
      name,
      role: 'Housekeeping',
      tasksCompleted: Math.floor(Math.random() * 10) + 8,
      averageRating: parseFloat((4.2 + Math.random() * 0.8).toFixed(1)),
      efficiency: Math.floor(Math.random() * 20) + 80
    });
  });
  
  // Add maintenance staff
  hotel.operationsTeam.maintenanceStaff.forEach((name, index) => {
    performance.push({
      id: performance.length + 1,
      name,
      role: 'Maintenance',
      tasksCompleted: Math.floor(Math.random() * 8) + 5,
      averageRating: parseFloat((4.3 + Math.random() * 0.7).toFixed(1)),
      efficiency: Math.floor(Math.random() * 18) + 82
    });
  });
  
  return performance;
};

// Mock recent activity
export const generateRecentActivity = (hotelKey: string) => {
  const hotel = HOTELS[hotelKey];
  const rooms = SAMPLE_ROOMS[hotelKey];
  
  return [
    {
      id: 1,
      type: 'housekeeping' as const,
      action: 'Task Completed',
      description: `Room ${rooms[5]} deep cleaning completed by ${hotel.operationsTeam.housekeepingStaff[0]}`,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      priority: 'HIGH'
    },
    {
      id: 2,
      type: 'maintenance' as const,
      action: 'Task Assigned',
      description: `HVAC maintenance assigned to ${hotel.operationsTeam.maintenanceStaff[0]}`,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      priority: 'MEDIUM'
    },
    {
      id: 3,
      type: 'housekeeping' as const,
      action: 'Task Created',
      description: `New room cleaning task for Room ${rooms[8]} created by ${hotel.operationsTeam.supervisor}`,
      timestamp: new Date(Date.now() - 900000).toISOString(),
      priority: 'LOW'
    },
    {
      id: 4,
      type: 'maintenance' as const,
      action: 'Task Started',
      description: `Electrical repair work started by ${hotel.operationsTeam.maintenanceStaff[1]} in Room ${rooms[12]}`,
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      priority: 'URGENT'
    },
    {
      id: 5,
      type: 'housekeeping' as const,
      action: 'Task Assigned',
      description: `Laundry service assigned to ${hotel.operationsTeam.housekeepingStaff[1]}`,
      timestamp: new Date(Date.now() - 1500000).toISOString(),
      priority: 'MEDIUM'
    },
    {
      id: 6,
      type: 'maintenance' as const,
      action: 'Task Completed',
      description: `Plumbing repair completed by ${hotel.operationsTeam.maintenanceStaff[0]} in Room ${rooms[3]}`,
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      priority: 'HIGH'
    }
  ];
};

// Operations statistics
export const generateOperationsStats = (hotelKey: string) => {
  return {
    housekeeping: {
      totalTasks: 45,
      pendingTasks: 8,
      activeTasks: 12,
      completedTasks: 25,
      activeStaff: HOTELS[hotelKey].operationsTeam.housekeepingStaff.length,
      averageTaskTime: 35
    },
    maintenance: {
      totalTasks: 23,
      pendingTasks: 4,
      activeTasks: 7,
      completedTasks: 12,
      activeStaff: HOTELS[hotelKey].operationsTeam.maintenanceStaff.length,
      totalCost: 1250.75
    }
  };
};
