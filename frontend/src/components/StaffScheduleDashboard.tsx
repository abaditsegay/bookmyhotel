import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Alert,
  Button,
  ButtonGroup,
  Spinner
} from 'react-bootstrap';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import axiosInstance from '../utils/axiosConfig';

interface StaffSchedule {
  id: number;
  staffId: number;
  staffName: string;
  staffEmail: string;
  hotelId: number;
  hotelName: string;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  shiftType: string;
  department: string;
  notes?: string;
  status: string;
}

interface ScheduleStats {
  totalSchedules: number;
  scheduledCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  departmentCounts: Record<string, number>;
}

const StaffScheduleDashboard: React.FC = () => {
  const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
  const [stats, setStats] = useState<ScheduleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  useEffect(() => {
    fetchScheduleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, viewMode]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      
      const startDate = getStartDate();
      const endDate = getEndDate();
      
      const [schedulesResponse, statsResponse] = await Promise.all([
        axiosInstance.get(`/api/staff-schedules?startDate=${startDate}&endDate=${endDate}`),
        axiosInstance.get(`/api/staff-schedules/stats?startDate=${startDate}&endDate=${endDate}`)
      ]);
      
      setSchedules(schedulesResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      setError('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      return start.toISOString().split('T')[0];
    } else {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      return start.toISOString().split('T')[0];
    }
  };

  const getEndDate = () => {
    if (viewMode === 'week') {
      const end = new Date(currentDate);
      end.setDate(currentDate.getDate() - currentDate.getDay() + 6);
      return end.toISOString().split('T')[0];
    } else {
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return end.toISOString().split('T')[0];
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getDateRange = () => {
    const start = getStartDate();
    const end = getEndDate();
    return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
  };

  const getDaysInRange = () => {
    const days = [];
    const start = new Date(getStartDate());
    const end = new Date(getEndDate());
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }
    
    return days;
  };

  const getSchedulesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(schedule => schedule.scheduleDate === dateStr);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'secondary';
      case 'CONFIRMED': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'danger';
      case 'NO_SHOW': return 'warning';
      default: return 'secondary';
    }
  };

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      'FRONTDESK': 'primary',
      'HOUSEKEEPING': 'success',
      'MAINTENANCE': 'warning',
      'SECURITY': 'danger',
      'RESTAURANT': 'info',
      'CONCIERGE': 'dark',
      'MANAGEMENT': 'secondary'
    };
    return colors[department] || 'secondary';
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading schedule dashboard...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Calendar className="me-2" size={24} />
                <h5 className="mb-0">Staff Schedule Dashboard</h5>
              </div>
              <div className="d-flex align-items-center gap-3">
                <ButtonGroup>
                  <Button 
                    variant={viewMode === 'week' ? 'primary' : 'outline-primary'}
                    onClick={() => setViewMode('week')}
                  >
                    Week
                  </Button>
                  <Button 
                    variant={viewMode === 'month' ? 'primary' : 'outline-primary'}
                    onClick={() => setViewMode('month')}
                  >
                    Month
                  </Button>
                </ButtonGroup>
                <ButtonGroup>
                  <Button variant="outline-secondary" onClick={() => navigateDate('prev')}>
                    <ChevronLeft size={16} />
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigateDate('next')}>
                    <ChevronRight size={16} />
                  </Button>
                </ButtonGroup>
              </div>
            </Card.Header>
            <Card.Body>
              <h6 className="text-center">{getDateRange()}</h6>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stats Cards */}
      {stats && (
        <Row className="mb-3">
          <Col md={2}>
            <Card className="text-center">
              <Card.Body className="py-2 px-2">
                <h6 className="text-primary mb-1">{stats.totalSchedules}</h6>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Total Schedules</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <Card.Body className="py-2 px-2">
                <h6 className="text-secondary mb-1">{stats.scheduledCount}</h6>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Scheduled</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <Card.Body className="py-2 px-2">
                <h6 className="text-primary mb-1">{stats.confirmedCount}</h6>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Confirmed</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <Card.Body className="py-2 px-2">
                <h6 className="text-success mb-1">{stats.completedCount}</h6>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Completed</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <Card.Body className="py-2 px-2">
                <h6 className="text-danger mb-1">{stats.cancelledCount}</h6>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Cancelled</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <Card.Body className="py-2 px-2">
                <h6 className="text-warning mb-1">{stats.noShowCount}</h6>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>No Show</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Calendar Grid */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row>
                {getDaysInRange().map((date, index) => {
                  const daySchedules = getSchedulesForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <Col 
                      key={index} 
                      className={viewMode === 'week' ? '' : 'mb-3'}
                      md={viewMode === 'week' ? true : 3}
                    >
                      <Card className={`h-100 ${isToday ? 'border-primary' : ''}`}>
                        <Card.Header className={`text-center ${isToday ? 'bg-primary text-white' : 'bg-light'}`}>
                          <strong>{date.toLocaleDateString('en-US', { weekday: 'short' })}</strong>
                          <br />
                          <span>{date.getDate()}</span>
                        </Card.Header>
                        <Card.Body className="p-2" style={{ minHeight: '200px' }}>
                          {daySchedules.length === 0 ? (
                            <div className="text-center text-muted mt-3">
                              <Users size={24} className="mb-2" />
                              <br />
                              <small>No schedules</small>
                            </div>
                          ) : (
                            <div className="schedule-list">
                              {daySchedules.map(schedule => (
                                <Card key={schedule.id} className="mb-2 border-0 bg-light">
                                  <Card.Body className="p-2">
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                      <Badge bg={getDepartmentColor(schedule.department)} className="mb-1">
                                        {schedule.department.replace('_', ' ')}
                                      </Badge>
                                      <Badge bg={getStatusBadgeVariant(schedule.status)}>
                                        {schedule.status}
                                      </Badge>
                                    </div>
                                    <div className="mb-1">
                                      <strong className="small">{schedule.staffName}</strong>
                                    </div>
                                    <div className="d-flex align-items-center text-muted small">
                                      <Clock size={12} className="me-1" />
                                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                    </div>
                                    <div className="small text-muted">
                                      {schedule.shiftType.replace('_', ' ')}
                                    </div>
                                    {schedule.notes && (
                                      <div className="small text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                                        {schedule.notes.length > 30 
                                          ? `${schedule.notes.substring(0, 30)}...` 
                                          : schedule.notes
                                        }
                                      </div>
                                    )}
                                  </Card.Body>
                                </Card>
                              ))}
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Department Summary */}
      {stats && Object.keys(stats.departmentCounts).length > 0 && (
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Department Distribution</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  {Object.entries(stats.departmentCounts).map(([department, count]) => (
                    <Col md={3} key={department} className="mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <Badge bg={getDepartmentColor(department)} className="me-2">
                          {department.replace('_', ' ')}
                        </Badge>
                        <strong>{count}</strong>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default StaffScheduleDashboard;
