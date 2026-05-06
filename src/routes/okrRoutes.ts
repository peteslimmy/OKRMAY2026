import { Router } from 'express';
import { OKRService } from '../services/okrService';
import { ProgressEngine } from '../services/progressEngine';
import { LockingEngine } from '../services/lockingEngine';

const router = Router();
const okrService = new OKRService();

// Get current objective
router.get('/objective/current', async (req, res) => {
  try {
    const objective = await okrService.getCurrentObjective();
    res.json({ objective });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current objective' });
  }
});

// Get dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const objective = await okrService.getCurrentObjective();
    if (!objective) {
      return res.status(404).json({ error: 'No active objective found' });
    }
    
    const krs = await okrService.getObjectiveKRs(objective.id);
    const dashboardData = {
      objective,
      krs: krs.map(kr => ({
        ...kr,
        subKRs: kr.sub_key_results || []
      }))
    };
    
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Create new objective
router.post('/objective', async (req, res) => {
  try {
    const { title, description, quarter, year } = req.body;
    
    // Validate that only one objective per quarter is allowed
    const existingObjectives = await okrService.getObjectives();
    const duplicate = existingObjectives.find(obj => 
      obj.quarter === quarter && obj.year === year
    );
    
    if (duplicate) {
      return res.status(400).json({ 
        error: 'Objective already exists for this quarter and year' 
      });
    }
    
    const { data, error } = await supabase
      .from('objectives')
      .insert([{ 
        title, 
        description, 
        quarter, 
        year,
        status: 'Active',
        lock_date: new Date(year, getLockDateForQuarter(quarter), 0).toISOString() // Last day of first month
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Create audit log
    await okrService.createAuditLog({
      entity_type: 'Objective',
      entity_id: data.id,
      action: 'CREATE',
      performed_by: req.user?.id || 'system'
    });
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create objective' });
  }
});

// Get lock date for a quarter (end of first month of the quarter)
function getLockDateForQuarter(quarter) {
  const quarterMap = {
    'Q1': 2, // March
    'Q2': 5, // June
    'Q3': 8, // September
    'Q4': 11 // December
  };
  return quarterMap[quarter] || 2;
}

// Add key result
router.post('/kr', async (req, res) => {
  try {
    const { objective_id, kr_slot, title, description } = req.body;
    
    // Validate that we don't exceed 4 KRs
    const existingKRs = await okrService.getObjectiveKRs(objective_id);
    if (existingKRs.length >= 4) {
      return res.status(400).json({ 
        error: 'Maximum 4 KRs allowed per objective' 
      });
    }
    
    // Validate KR slot is unique
    const slotExists = existingKRs.some(kr => kr.kr_slot === kr_slot);
    if (slotExists) {
      return res.status(400).json({ 
        error: 'KR slot already used' 
      });
    }
    
    const { data, error } = await supabase
      .from('key_results')
      .insert([{ 
        objective_id, 
        kr_slot, 
        title, 
        description,
        progress: 0,
        status: 'Red'
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Create audit log
    await okrService.createAuditLog({
      entity_type: 'KeyResult',
      entity_id: data.id,
      action: 'CREATE',
      performed_by: req.user?.id || 'system'
    });
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create key result' });
  }
});

// Add sub key result
router.post('/sub-kr', async (req, res) => {
  try {
    const { kr_id, title, weight } = req.body;
    
    const { data, error } = await supabase
      .from('sub_key_results')
      .insert([{ 
        kr_id, 
        title, 
        weight: weight || 1,
        progress: 0
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Create audit log
    await okrService.createAuditLog({
      entity_type: 'SubKeyResult',
      entity_id: data.id,
      action: 'CREATE',
      performed_by: req.user?.id || 'system'
    });
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create sub key result' });
  }
});

// Update sub KR progress
router.put('/sub-kr/progress', async (req, res) => {
  try {
    const { subKrId, progress } = req.body;
    
    // Validate progress
    if (progress < 0 || progress > 100) {
      return res.status(400).json({ 
        error: 'Progress must be between 0 and 100' 
      });
    }
    
    const { data, error } = await supabase
      .from('sub_key_results')
      .update({ progress })
      .eq('id', subKrId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update parent KR progress
    const subKRs = await okrService.getKRSubKRs(data.kr_id);
    const krProgress = ProgressEngine.calculateKRProgress(
      subKRs.map(skr => ({ progress: skr.progress, weight: skr.weight || 1 }))
    );
    
    // Update KR with new progress
    await supabase
      .from('key_results')
      .update({ 
        progress: krProgress,
        status: ProgressEngine.determineStatus(krProgress)
      })
      .eq('id', data.kr_id);
    
    // Create audit log
    await okrService.createAuditLog({
      entity_type: 'SubKeyResult',
      entity_id: subKrId,
      action: 'UPDATE',
      performed_by: req.user?.id || 'system'
    });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sub KR progress' });
  }
});

// Get audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await okrService.getAuditLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Lock quarter
router.post('/lock-quarter', async (req, res) => {
  try {
    const { objectiveId } = req.body;
    
    const objective = await okrService.lockObjective(objectiveId);
    
    // Create audit log
    await okrService.createAuditLog({
      entity_type: 'Objective',
      entity_id: objectiveId,
      action: 'LOCK',
      performed_by: req.user?.id || 'system'
    });
    
    res.json(objective);
  } catch (error) {
    res.status(500).json({ error: 'Failed to lock objective' });
  }
});

// Override lock
router.post('/override-lock', async (req, res) => {
  try {
    const { objectiveId, reason } = req.body;
    
    const { data, error } = await supabase
      .from('objectives')
      .update({ status: 'Active' })
      .eq('id', objectiveId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Create audit log
    await okrService.createAuditLog({
      entity_type: 'Objective',
      entity_id: objectiveId,
      action: 'OVERRIDE',
      performed_by: req.user?.id || 'system',
      reason
    });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to override lock' });
  }
});

// Get KR version history
router.get('/kr-version-history', async (req, res) => {
  try {
    const { kr_id } = req.query;
    const { data, error } = await supabase
      .from('kr_version_history')
      .select('*')
      .eq('kr_id', kr_id)
      .order('version_number', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch version history' });
  }
});

export default router;