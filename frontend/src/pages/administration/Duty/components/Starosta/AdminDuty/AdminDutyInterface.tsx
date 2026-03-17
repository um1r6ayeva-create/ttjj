import { useState } from 'react';
import AssignDutyForm from './AssignDutyForm';
import AssignedDutiesList from './AssignedDutiesList';
import './AdminInterface.css';


interface Duty {
  id: number;
  duty_type: string;
  room_number: number;
  floor: number;
  assigned_to: Array<{
    id: number;
    name: string;
    surname: string;
    n_room?: number;
    role: string;
  }>;
  date_assigned: string;
  date_due: string;
  status: string;
  notes?: string;
  assigned_by?: {
    id: number;
    name: string;
    surname: string;
    role: string;
  };
}


const AdminDutyInterface = () => {
  const [assignedDuties, setAssignedDuties] = useState<Duty[]>([]);

  const handleDutyAssigned = (newDuty: Duty) => {
    setAssignedDuties(prev => [...prev, newDuty]);
  };

  const handleDutiesLoaded = (duties: Duty[]) => {
    setAssignedDuties(duties);
  };

  const handleDutyUpdated = (updatedDuty: Duty) => {
    setAssignedDuties(prev => 
      prev.map(duty => duty.id === updatedDuty.id ? updatedDuty : duty)
    );
  };

  return (
    <div className="admin-interface">
      <div className="interface-container">
        <AssignDutyForm onDutyAssigned={handleDutyAssigned} />
        <AssignedDutiesList 
          duties={assignedDuties} 
          onDutiesLoaded={handleDutiesLoaded}
          onDutyUpdated={handleDutyUpdated}
        />
     
      </div>
    </div>
  );
};

export default AdminDutyInterface;