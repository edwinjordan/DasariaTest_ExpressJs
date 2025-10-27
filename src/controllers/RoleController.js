const RoleRepository = require('../repositories/RoleRepository');
const { handleValidationErrors, asyncHandler } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

class RoleController {
    static validateCreateRole = [
        body('name')
            .notEmpty()
            .withMessage('Role name is required')
            .isLength({ min: 2, max: 50 })
            .withMessage('Role name must be between 2 and 50 characters')
            .matches(/^[a-zA-Z_]+$/)
            .withMessage('Role name can only contain letters and underscores'),
        body('description')
            .optional()
            .isLength({ max: 255 })
            .withMessage('Description cannot exceed 255 characters'),
        body('permissions')
            .optional()
            .isArray()
            .withMessage('Permissions must be an array'),
        body('permissions.*')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Permission IDs must be valid integers'),
        handleValidationErrors
    ];

    static validateUpdateRole = [
        param('id').isInt({ min: 1 }).withMessage('Valid role ID is required'),
        body('name')
            .optional()
            .isLength({ min: 2, max: 50 })
            .withMessage('Role name must be between 2 and 50 characters')
            .matches(/^[a-zA-Z_]+$/)
            .withMessage('Role name can only contain letters and underscores'),
        body('description')
            .optional()
            .isLength({ max: 255 })
            .withMessage('Description cannot exceed 255 characters'),
        body('permissions')
            .optional()
            .isArray()
            .withMessage('Permissions must be an array'),
        body('permissions.*')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Permission IDs must be valid integers'),
        handleValidationErrors
    ];

    static validateRoleId = [
        param('id').isInt({ min: 1 }).withMessage('Valid role ID is required'),
        handleValidationErrors
    ];

    static validateAssignPermissions = [
        param('id').isInt({ min: 1 }).withMessage('Valid role ID is required'),
        body('permissions')
            .isArray({ min: 1 })
            .withMessage('Permissions array is required and must not be empty'),
        body('permissions.*')
            .isInt({ min: 1 })
            .withMessage('Permission IDs must be valid integers'),
        handleValidationErrors
    ];

    // GET /roles - Get all roles with pagination
    static getAllRoles = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const filters = {};
        if (search) {
            filters.search = search;
        }

        const { roles, total } = await RoleRepository.findAllWithPagination(
            parseInt(limit),
            offset,
            filters
        );

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: roles,
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

    // GET /roles/:id - Get role by ID
    static getRoleById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const role = await RoleRepository.findByIdWithPermissions(id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        res.json({
            success: true,
            data: role
        });
    });

    // POST /roles - Create new role
    static createRole = asyncHandler(async (req, res) => {
        const { name, description, permissions = [] } = req.body;

        // Check if role name already exists
        const existingRole = await RoleRepository.findByName(name);
        if (existingRole) {
            return res.status(409).json({
                success: false,
                message: 'Role name already exists'
            });
        }

        const roleData = {
            name,
            description,
            
        };

        const role = await RoleRepository.create(roleData);

        // Assign permissions if provided
        if (permissions.length > 0) {
            await RoleRepository.assignPermissions(role.id, permissions);
        }

        // Fetch the created role with permissions
        const createdRole = await RoleRepository.findByIdWithPermissions(role.id);

        res.status(201).json({
            success: true,
            message: 'Role created successfully',
            data: createdRole
        });
    });

    // PUT /roles/:id - Update role
    static updateRole = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, description, permissions } = req.body;

        const existingRole = await RoleRepository.findById(id);
        if (!existingRole) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        // Check if new name conflicts with existing role
        if (name && name !== existingRole.name) {
            const conflictRole = await RoleRepository.findByName(name);
            if (conflictRole && conflictRole.id !== parseInt(id)) {
                return res.status(409).json({
                    success: false,
                    message: 'Role name already exists'
                });
            }
        }

        const updateData = {
            ...(name && { name }),
            ...(description !== undefined && { description }),
        };

        await RoleRepository.update(id, updateData);

        // Update permissions if provided
        if (permissions !== undefined) {
            await RoleRepository.assignPermissions(id, permissions);
        }

        // Fetch updated role
        const updatedRole = await RoleRepository.findByIdWithPermissions(id);

        res.json({
            success: true,
            message: 'Role updated successfully',
            data: updatedRole
        });
    });

    // DELETE /roles/:id - Delete role
    static deleteRole = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const role = await RoleRepository.findById(id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        // Check if role is system role (cannot be deleted)
        if (['admin', 'staff', 'customer'].includes(role.name)) {
            return res.status(403).json({
                success: false,
                message: 'System roles cannot be deleted'
            });
        }

        // Check if role is assigned to users
        const usersCount = await RoleRepository.getUsersCount(id);
        if (usersCount > 0) {
            return res.status(409).json({
                success: false,
                message: `Cannot delete role. It is assigned to ${usersCount} user(s)`
            });
        }

        await RoleRepository.delete(id);

        res.json({
            success: true,
            message: 'Role deleted successfully'
        });
    });

    // POST /roles/:id/assign-permissions - Assign permissions to role
    static assignPermissions = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { permissions } = req.body;

        const role = await RoleRepository.findById(id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        await RoleRepository.assignPermissions(id, permissions);

        const updatedRole = await RoleRepository.findByIdWithPermissions(id);

        res.json({
            success: true,
            message: 'Permissions assigned successfully',
            data: updatedRole
        });
    });

    // DELETE /roles/:id/remove-permissions - Remove permissions from role
    static removePermissions = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { permissions } = req.body;

        const role = await RoleRepository.findById(id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        await RoleRepository.removePermissions(id, permissions);

        const updatedRole = await RoleRepository.findByIdWithPermissions(id);

        res.json({
            success: true,
            message: 'Permissions removed successfully',
            data: updatedRole
        });
    });

    // GET /roles/:id/permissions - Get role permissions
    static getRolePermissions = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const role = await RoleRepository.findById(id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        const permissions = await RoleRepository.getPermissions(id);

        res.json({
            success: true,
            data: {
                role_id: parseInt(id),
                role_name: role.name,
                permissions
            }
        });
    });

    // GET /roles/stats - Get role statistics
    static getRoleStats = asyncHandler(async (req, res) => {
        const stats = await RoleRepository.getStats();

        res.json({
            success: true,
            data: stats
        });
    });
}

module.exports = RoleController;