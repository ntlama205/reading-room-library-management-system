import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
const router = Router();
const shape = r => ({id:r.id,name:r.name,membershipId:r.membership_id,role:r.role});

router.put('/membership/:membershipId', async (req,res,next) => {
  try {
    const {name,membershipId,password,role}=req.body;
    if (!String(name||'').trim() || !/^\\d+$/.test(String(membershipId||'')) || !['admin','member'].includes(role)) return res.status(400).json({error:'Invalid user details.'});
    if (password) {
      const hash=await bcrypt.hash(String(password),10);
      const [r]=await pool.execute('UPDATE users SET name=?,membership_id=?,password_hash=?,role=? WHERE membership_id=?',[name.trim(),String(membershipId),hash,role,req.params.membershipId]);
      if(!r.affectedRows)return res.status(404).json({error:'User not found.'});
    } else {
      const [r]=await pool.execute('UPDATE users SET name=?,membership_id=?,role=? WHERE membership_id=?',[name.trim(),String(membershipId),role,req.params.membershipId]);
      if(!r.affectedRows)return res.status(404).json({error:'User not found.'});
    }
    res.json({ok:true});
  } catch(e){if(e.code==='ER_DUP_ENTRY')return res.status(409).json({error:'Membership ID already exists.'});next(e);}
});
router.delete('/membership/:membershipId', async(req,res,next)=>{try{const[r]=await pool.execute('DELETE FROM users WHERE membership_id=?',[req.params.membershipId]);if(!r.affectedRows)return res.status(404).json({error:'User not found.'});res.status(204).end();}catch(e){next(e);}});

router.get('/', async (_req,res,next) => { try { const [rows]=await pool.query('SELECT id,name,membership_id,role FROM users ORDER BY name'); res.json(rows.map(shape)); } catch(e){next(e);} });
router.post('/login', async (req,res,next) => {
  try {
    const { membershipId, password } = req.body;
    if (!membershipId || !password) return res.status(400).json({error:'Membership ID and password are required.'});
    const [rows]=await pool.execute('SELECT * FROM users WHERE membership_id=?',[String(membershipId)]);
    if (!rows.length || !(await bcrypt.compare(String(password),rows[0].password_hash))) return res.status(401).json({error:'Invalid membership ID or password.'});
    res.json(shape(rows[0]));
  } catch(e){next(e);}
});
router.post('/', async (req,res,next) => {
  try {
    const {name,membershipId,password,role='member'}=req.body;
    if (!String(name||'').trim() || !/^\d+$/.test(String(membershipId||'')) || !String(password||'') || !['admin','member'].includes(role)) return res.status(400).json({error:'Name, numeric membership ID, password and valid role are required.'});
    const hash=await bcrypt.hash(String(password),10);
    const [r]=await pool.execute('INSERT INTO users(name,membership_id,password_hash,role) VALUES(?,?,?,?)',[name.trim(),String(membershipId),hash,role]);
    res.status(201).json({id:r.insertId,name:name.trim(),membershipId:String(membershipId),role});
  } catch(e){if(e.code==='ER_DUP_ENTRY') return res.status(409).json({error:'Membership ID already exists.'});next(e);}
});
router.put('/:id', async (req,res,next) => {
  try {
    const {name,membershipId,password,role}=req.body;
    if (!String(name||'').trim() || !/^\d+$/.test(String(membershipId||'')) || !['admin','member'].includes(role)) return res.status(400).json({error:'Invalid user details.'});
    if(password) {
      const hash=await bcrypt.hash(String(password),10);
      await pool.execute('UPDATE users SET name=?,membership_id=?,password_hash=?,role=? WHERE id=?',[name.trim(),String(membershipId),hash,role,req.params.id]);
    } else {
      await pool.execute('UPDATE users SET name=?,membership_id=?,role=? WHERE id=?',[name.trim(),String(membershipId),role,req.params.id]);
    }
    const [rows]=await pool.execute('SELECT id,name,membership_id,role FROM users WHERE id=?',[req.params.id]);
    if(!rows.length) return res.status(404).json({error:'User not found.'});
    res.json(shape(rows[0]));
  } catch(e){if(e.code==='ER_DUP_ENTRY') return res.status(409).json({error:'Membership ID already exists.'});next(e);}
});
router.delete('/:id', async (req,res,next) => { try { const [r]=await pool.execute('DELETE FROM users WHERE id=?',[req.params.id]); if(!r.affectedRows)return res.status(404).json({error:'User not found.'});res.status(204).end(); } catch(e){next(e);} });
export default router;
