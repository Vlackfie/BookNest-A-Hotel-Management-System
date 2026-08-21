import { Router, Response } from 'express';
import { getDb, queryAll, queryOne, executeRun } from '../db/database';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/inventory - List Inventory Items
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { category, low_stock } = req.query;
    const db = await getDb();

    let sql = `SELECT * FROM Inventory WHERE 1=1`;
    const params: any[] = [];

    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }
    if (low_stock === 'true') {
      sql += ` AND quantity <= min_stock_alert`;
    }

    sql += ` ORDER BY id DESC`;

    const inventory = queryAll(db, sql, params);
    return res.json({ inventory });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch inventory.' });
  }
});

// POST /api/inventory - Add Item
router.post('/', authenticateToken, authorizeRoles('Owner', 'Manager'), async (req: AuthRequest, res: Response) => {
  try {
    const { item_name, category, quantity, unit, min_stock_alert } = req.body;
    if (!item_name || !category || quantity === undefined) {
      return res.status(400).json({ error: 'Item name, category, and quantity are required.' });
    }

    // Business Rule #6: Inventory quantities cannot become negative
    if (Number(quantity) < 0) {
      return res.status(400).json({ error: 'BUSINESS RULE VIOLATION: Inventory quantity cannot be negative.' });
    }

    const db = await getDb();
    const resRun = executeRun(
      db,
      `INSERT INTO Inventory (item_name, category, quantity, unit, min_stock_alert)
       VALUES (?, ?, ?, ?, ?)`,
      [item_name, category, Number(quantity), unit || 'Pcs', Number(min_stock_alert || 10)]
    );

    const item = queryOne(db, `SELECT * FROM Inventory WHERE id = ?`, [resRun.lastInsertRowid]);
    return res.status(201).json({ message: 'Inventory item added.', item });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add inventory item.' });
  }
});

// PUT /api/inventory/:id - Restock or Update Quantity
router.put('/:id', authenticateToken, authorizeRoles('Owner', 'Manager', 'Housekeeping Staff', 'Maintenance Staff'), async (req: AuthRequest, res: Response) => {
  try {
    const itemId = Number(req.params.id);
    const { quantity, min_stock_alert, restock_add } = req.body;

    const db = await getDb();
    const item = queryOne(db, `SELECT * FROM Inventory WHERE id = ?`, [itemId]);
    if (!item) return res.status(404).json({ error: 'Inventory item not found.' });

    let newQty = item.quantity;
    if (restock_add !== undefined) {
      newQty += Number(restock_add);
    } else if (quantity !== undefined) {
      newQty = Number(quantity);
    }

    // Business Rule #6: Inventory quantities cannot become negative
    if (newQty < 0) {
      return res.status(400).json({ error: 'BUSINESS RULE VIOLATION: Inventory quantity cannot become negative.' });
    }

    executeRun(
      db,
      `UPDATE Inventory 
       SET quantity = ?, min_stock_alert = COALESCE(?, min_stock_alert), last_restocked = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newQty, min_stock_alert, itemId]
    );

    // If quantity is now below threshold, generate system notification
    if (newQty <= (min_stock_alert || item.min_stock_alert)) {
      executeRun(
        db,
        `INSERT INTO Notifications (role_target, title, message) VALUES ('Manager', 'Low Stock Alert', ?)`,
        [`Stock for item '${item.item_name}' (${newQty} ${item.unit}) has dropped below alert threshold.`]
      );
    }

    return res.json({ message: 'Inventory updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update inventory.' });
  }
});

export default router;



