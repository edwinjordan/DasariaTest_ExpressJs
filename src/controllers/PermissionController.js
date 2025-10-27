const PermissionRepository = require('../repositories/PermissionRepository');
const { handleValidationErrors, asyncHandler } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

class PermissionController {
    static validateCreatePermission = [
        body('name')
            .notEmpty()
            .withMessage('Permission name is required')
            .isLength({ min: 2, max: 100 })
            .withMessage('Permission name must be between 2 and 100 characters')
            .matches(/^[a-zA-Z_.:]+$/)
            .withMessage('Permission name can only contain letters, underscores, dots, and colons'),
        body('description')
            .optional()
            .isLength({ max: 255 })
            .withMessage('Description cannot exceed 255 characters'),
        body('resource')
            .notEmpty()
            .withMessage('Resource is required')
            .isLength({ min: 2, max: 50 })
            .withMessage('Resource must be between 2 and 50 characters'),
        body('action')
            .notEmpty()
            .withMessage('Action is required')
            .isIn(['create', 'read', 'update', 'delete', 'manage', 'view'])
            .withMessage('Action must be one of: create, read, update, delete, manage, view'),
        handleValidationErrors
    ];

    static validateUpdatePermission = [
        param('id').isInt({ min: 1 }).withMessage('Valid permission ID is required'),
        body('name')
            .optional()
            .isLength({ min: 2, max: 100 })
            .withMessage('Permission name must be between 2 and 100 characters')
            .matches(/^[a-zA-Z_.:]+$/)
            .withMessage('Permission name can only contain letters, underscores, dots, and colons'),
        body('description')
            .optional()
            .isLength({ max: 255 })
            .withMessage('Description cannot exceed 255 characters'),
        body('resource')
            .optional()
            .isLength({ min: 2, max: 50 })
            .withMessage('Resource must be between 2 and 50 characters'),
        body('action')
            .optional()
            .isIn(['create', 'read', 'update', 'delete', 'manage', 'view'])
            .withMessage('Action must be one of: create, read, update, delete, manage, view'),
        handleValidationErrors
    ];

    static validatePermissionId = [
        param('id').isInt({ min: 1 }).withMessage('Valid permission ID is required'),
        handleValidationErrors
    ];

    // GET /permissions - Get all permissions with pagination
    static getAllPermissions = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, resource, action, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const filters = {};
        if (resource) filters.resource = resource;
        if (action) filters.action = action;
        if (search) filters.search = search;

        const { permissions, total } = await PermissionRepository.findAllWithPagination(
            parseInt(limit),
            offset,
            filters
        );

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: permissions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    });

    // GET /permissions/:id - Get permission by ID
    static getPermissionById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const permission = await PermissionRepository.findById(id);

        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'Permission not found'
            });
        }

        res.json({
            success: true,
            data: permission
        });
    });

    // POST /permissions - Create new permission
    static createPermission = asyncHandler(async (req, res) => {
        const { name, description, resource, action } = req.body;

        // Check if permission name already exists
        const existingPermission = await PermissionRepository.findByName(name);
        if (existingPermission) {
            return res.status(409).json({
                success: false,
                message: 'Permission name already exists'
            });
        }

        const permissionData = {
            name,
            description,
            resource,
            action,
            created_by: req.user.id
        };

        const permission = await PermissionRepository.create(permissionData);

        res.status(201).json({
            success: true,
            message: 'Permission created successfully',
            data: permission
        });
    });

    // PUT /permissions/:id - Update permission
    static updatePermission = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, description, resource, action } = req.body;

        const existingPermission = await PermissionRepository.findById(id);
        if (!existingPermission) {
            return res.status(404).json({
                success: false,
                message: 'Permission not found'
            });
        }

        // Check if new name conflicts with existing permission
        if (name && name !== existingPermission.name) {
            const conflictPermission = await PermissionRepository.findByName(name);
            if (conflictPermission && conflictPermission.id !== parseInt(id)) {
                return res.status(409).json({
                    success: false,
                    message: 'Permission name already exists'
                });
            }
        }

        const updateData = {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(resource && { resource }),
            ...(action && { action }),
            updated_by: req.user.id
        };

        const updatedPermission = await PermissionRepository.update(id, updateData);

        res.json({
            success: true,
            message: 'Permission updated successfully',
            data: updatedPermission
        });
    });

    // DELETE /permissions/:id - Delete permission
    static deletePermission = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const permission = await PermissionRepository.findById(id);
        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'Permission not found'
            });
        }

        // Check if permission is assigned to roles
        const rolesCount = await PermissionRepository.getRolesCount(id);
        if (rolesCount > 0) {
            return res.status(409).json({
                success: false,
                message: `Cannot delete permission. It is assigned to ${rolesCount} role(s)`
            });
        }

        await PermissionRepository.delete(id);

        res.json({
            success: true,
            message: 'Permission deleted successfully'
        });
    });

    // GET /permissions/resources - Get all unique resources
    static getResources = asyncHandler(async (req, res) => {
        const resources = await PermissionRepository.getUniqueResources();

        res.json({
            success: true,
            data: resources
        });
    });

    // GET /permissions/actions - Get all available actions
    static getActions = asyncHandler(async (req, res) => {
        const actions = ['create', 'read', 'update', 'delete', 'manage', 'view'];

        res.json({
            success: true,
            data: actions
        });
    });

    // GET /permissions/by-resource/:resource - Get permissions by resource
    static getPermissionsByResource = asyncHandler(async (req, res) => {
        const { resource } = req.params;
        const permissions = await PermissionRepository.findByResource(resource);

        res.json({
            success: true,
            data: permissions
        });
    });

    // GET /permissions/stats - Get permission statistics
    static getPermissionStats = asyncHandler(async (req, res) => {
        const stats = await PermissionRepository.getStats();

        res.json({
            success: true,
            data: stats
        });
    });
}

module.exports = PermissionController;