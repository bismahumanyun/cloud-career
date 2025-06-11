import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, TableColumn, TableAction } from '../common/DataTable';
import { FormModal } from '../common/FormModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useApi, useApiList } from '../../hooks/useApi';
import { securityRoleService } from '../../services/api';
import { SecurityRole } from '../../types/entities';
import { Edit, Trash2, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';

const securityRoleSchema = z.object({
  role: z.string().min(1, 'Role name is required'),
  isInactive: z.boolean(),
});

type SecurityRoleFormData = z.infer<typeof securityRoleSchema>;

export function SecurityRolesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SecurityRole | null>(null);
  const [deletingRole, setDeletingRole] = useState<SecurityRole | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const rolesApi = useApiList(securityRoleService.getAll);
  const createApi = useApi(securityRoleService.create, {
    showSuccessToast: true,
    successMessage: 'Security role created successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      rolesApi.refresh();
      form.reset();
    },
  });
  const updateApi = useApi(securityRoleService.update, {
    showSuccessToast: true,
    successMessage: 'Security role updated successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingRole(null);
      rolesApi.refresh();
      form.reset();
    },
  });
  const deleteApi = useApi(securityRoleService.delete, {
    showSuccessToast: true,
    successMessage: 'Security role deleted successfully',
    onSuccess: () => {
      setDeletingRole(null);
      rolesApi.refresh();
    },
  });

  // Form setup
  const form = useForm<SecurityRoleFormData>({
    resolver: zodResolver(securityRoleSchema),
    defaultValues: {
      role: '',
      isInactive: false,
    },
  });

  // Filter roles based on search term
  const filteredRoles = rolesApi.data.filter(role =>
    role.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns: TableColumn<SecurityRole>[] = [
    {
      key: 'role',
      label: 'Role Name',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'isInactive',
      label: 'Status',
      render: (value) => (
        <Badge variant={value ? 'destructive' : 'default'}>
          {value ? 'Inactive' : 'Active'}
        </Badge>
      ),
    },
    {
      key: 'timeStamp',
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Table actions
  const actions: TableAction<SecurityRole>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (role) => {
        setEditingRole(role);
        form.reset({
          role: role.role,
          isInactive: role.isInactive,
        });
        setIsFormOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (role) => setDeletingRole(role),
    },
  ];

  const handleSubmit = async (data: SecurityRoleFormData) => {
    if (editingRole) {
      await updateApi.execute(editingRole.id, data);
    } else {
      await createApi.execute(data);
    }
  };

  const handleDelete = async () => {
    if (deletingRole) {
      await deleteApi.execute(deletingRole.id);
    }
  };

  const openAddForm = () => {
    setEditingRole(null);
    form.reset();
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Roles</h1>
        <p className="text-gray-600">Manage system security roles and permissions</p>
      </div>

      <DataTable
        title="Security Roles"
        data={filteredRoles}
        columns={columns}
        actions={actions}
        onAdd={openAddForm}
        onSearch={setSearchTerm}
        isLoading={rolesApi.isLoading}
        searchPlaceholder="Search by role name..."
        emptyMessage="No security roles found"
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRole(null);
          form.reset();
        }}
        title={editingRole ? 'Edit Security Role' : 'Add Security Role'}
        onSubmit={form.handleSubmit(handleSubmit)}
        isLoading={createApi.isLoading || updateApi.isLoading}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role Name *</Label>
            <Input
              id="role"
              {...form.register('role')}
              placeholder="e.g., Admin, Manager, HR"
            />
            {form.formState.errors.role && (
              <p className="text-sm text-red-600">{form.formState.errors.role.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Role Status</Label>
                <p className="text-sm text-gray-600">
                  Mark as inactive to disable this role
                </p>
              </div>
              <Switch
                checked={!form.watch('isInactive')}
                onCheckedChange={(checked) => form.setValue('isInactive', !checked)}
              />
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingRole} onOpenChange={() => setDeletingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role{' '}
              <strong>{deletingRole?.role}</strong>.
              <br /><br />
              <strong>Warning:</strong> This may affect users assigned to this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
