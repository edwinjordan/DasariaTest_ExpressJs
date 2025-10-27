const { body, param } = require('express-validator');
const TicketCategoryRepository = require('../repositories/TicketCategoryRepository');

class TicketCategoryController {
    static validateCreate = [
        body('name')
            .notEmpty()
            .withMessage('Category name is required')
            .isLength({ min: 2, max: 100 })
            .withMessage('Category name must be between 2 and 100 characters'),
        body('description')
            .optional()
            .isLength({ max: 255 })
            .withMessage('Description cannot exceed 255 characters'),
        body('priority_level')
            .optional()
            .isInt({ min: 1, max: 10 })
            .withMessage('Priority level must be between 1 and 10'),
    ];

    static validateUpdate = [
        param('id').isInt({ min: 1 }).withMessage('Valid category ID is required'),
        body('name')
            .optional()
            .isLength({ min: 2, max: 100 })
            .withMessage('Category name must be between 2 and 100 characters'),
        body('description')
            .optional()
            .isLength({ max: 255 })
            .withMessage('Description cannot exceed 255 characters'),
        body('priority_level')
            .optional()
            .isInt({ min: 1, max: 10 })
            .withMessage('Priority level must be between 1 and 10'),
      
    ];

    static validateId = [
        param('id').isInt({ min: 1 }).withMessage('Valid category ID is required')
    ];

    // GET /ticket-categories - Get all categories
    static async index(req, res, next) {
        try {

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;

            let result;
            if (search) {
                result = await TicketCategoryRepository.searchCategories(search, page, limit);
            } else {
                result = await TicketCategoryRepository.paginate(page, limit, {}, 'name ASC');
            }

            res.json({
                success: true,
                message: 'Ticket categories retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /ticket-categories/stats - Get category statistics
    static async stats(req, res, next) {
        try {
            const categories = await TicketCategoryRepository.getAllWithStats();

            const stats = {
                total_categories: categories.length,
                total_tickets: categories.reduce((sum, cat) => sum + parseInt(cat.ticket_count), 0),
                by_category: categories.map(cat => ({
                    category_id: cat.id,
                    category_name: cat.name,
                    priority_level: cat.priority_level,
                    total_tickets: parseInt(cat.ticket_count),
                    open_tickets: parseInt(cat.open_tickets),
                    in_progress_tickets: parseInt(cat.in_progress_tickets),
                    resolved_tickets: parseInt(cat.resolved_tickets)
                }))
            };

            res.json({
                success: true,
                message: 'Category statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /ticket-categories/:id - Get category by ID
    static async show(req, res, next) {
        try {
            const { id } = req.params;
            const category = await TicketCategoryRepository.getCategoryWithStats(id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket category not found'
                });
            }

            res.json({
                success: true,
                message: 'Ticket category retrieved successfully',
                data: category
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /ticket-categories - Create new category
    static async create(req, res, next) {
        try {
            const { name, description, priority_level } = req.body;

            // Check if category name already exists
            const existingCategory = await TicketCategoryRepository.findByName(name);
            if (existingCategory) {
                return res.status(409).json({
                    success: false,
                    message: 'Category name already exists'
                });
            }

            const categoryData = {
                name,
                description,
                priority_level: priority_level || 5
            };

            const category = await TicketCategoryRepository.create(categoryData);

            res.status(201).json({
                success: true,
                message: 'Ticket category created successfully',
                data: category
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /ticket-categories/:id - Update category
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const { name, description, priority_level } = req.body;

            const existingCategory = await TicketCategoryRepository.findById(id);
            if (!existingCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket category not found'
                });
            }

            // Check if new name conflicts with existing category
            if (name && name !== existingCategory.name) {
                const conflictCategory = await TicketCategoryRepository.findByName(name);
                if (conflictCategory && conflictCategory.id !== parseInt(id)) {
                    return res.status(409).json({
                        success: false,
                        message: 'Category name already exists'
                    });
                }
            }

            const updateData = {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(priority_level && { priority_level })
            };

            await TicketCategoryRepository.update(id, updateData);

            // Get updated category with stats
            const updatedCategory = await TicketCategoryRepository.getCategoryWithStats(id);

            res.json({
                success: true,
                message: 'Ticket category updated successfully',
                data: updatedCategory
            });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /ticket-categories/:id - Delete category
    static async destroy(req, res, next) {
        try {
            const { id } = req.params;

            const category = await TicketCategoryRepository.findById(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket category not found'
                });
            }

            // Check if category has tickets
            const hasTickets = await TicketCategoryRepository.hasTickets(id);
            if (hasTickets) {
                const categoryWithStats = await TicketCategoryRepository.getCategoryWithStats(id);
                return res.status(409).json({
                    success: false,
                    message: `Cannot delete category. It has ${categoryWithStats.ticket_count} ticket(s)`
                });
            }

            await TicketCategoryRepository.delete(id);

            res.json({
                success: true,
                message: 'Ticket category deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = TicketCategoryController;
