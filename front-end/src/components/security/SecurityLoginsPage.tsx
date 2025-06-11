import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, TableColumn, TableAction } from '../common/DataTable';
import { FormModal } from '../common/FormModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useApi, useApiList } from '../../hooks/useApi';
import { securityLoginService, systemLanguageCodeService } from '../../services/api';
import { SecurityLogin } from '../../types/entities';
import { Edit, Trash2, User, Mail, Phone, Shield } from 'lucide-react';
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

const securityLoginSchema = z.object({
  login: z.string().min(1, 'Login is required'),
  emailAddress: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().optional(),
  fullName: z.string().min(1, 'Full name is required'),
  forceChangePassword: z.boolean(),
  preferredLanguage: z.string().min(1, 'Preferred language is required'),
});

type SecurityLoginFormData = z.infer<typeof securityLoginSchema>;

export function SecurityLoginsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLogin, setEditingLogin] = useState<SecurityLogin | null>(null);
  const [deletingLogin, setDeletingLogin] = useState<SecurityLogin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const loginsApi = useApiList(securityLoginService.getAll);
  const languagesApi = useApiList(systemLanguageCodeService.getAll);
  const createApi = useApi(securityLoginService.create, {
    showSuccessToast: true,
    successMessage: 'Security login created successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      loginsApi.refresh();
      form.reset();
    },
  });
  const updateApi = useApi(securityLoginService.update, {
    showSuccessToast: true,
    successMessage: 'Security login updated successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingLogin(null);
      loginsApi.refresh();
      form.reset();
    },
  });
  const deleteApi = useApi(securityLoginService.delete, {
    showSuccessToast: true,
    successMessage: 'Security login deleted successfully',
    onSuccess: () => {
      setDeletingLogin(null);
      loginsApi.refresh();
    },
  });

  // Form setup
  const form = useForm<SecurityLoginFormData>({
    resolver: zodResolver(securityLoginSchema),
    defaultValues: {
      login: '',
      emailAddress: '',
      phoneNumber: '',
      fullName: '',
      forceChangePassword: false,
      preferredLanguage: 'en',
    },
  });

  // Load languages on mount
  useEffect(() => {
    languagesApi.execute();
  }, []);

  // Filter logins based on search term
  const filteredLogins = loginsApi.data.filter(login =>
    login.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
    login.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    login.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns: TableColumn<SecurityLogin>[] = [
    {
      key: 'login',
      label: 'Login ID',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'fullName',
      label: 'Full Name',
      sortable: true,
    },
    {
      key: 'emailAddress',
      label: 'Email',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'phoneNumber',
      label: 'Phone',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{value || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'forceChangePassword',
      label: 'Password Status',
      render: (value) => (
        <Badge variant={value ? 'destructive' : 'default'}>
          {value ? 'Force Change' : 'Valid'}
        </Badge>
      ),
    },
    {
      key: 'preferredLanguage',
      label: 'Language',
      render: (value) => {
        const language = languagesApi.data.find(l => l.languageId === value);
        return language?.name || value;
      },
    },
    {
      key: 'timeStamp',
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Table actions
  const actions: TableAction<SecurityLogin>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (login) => {
        setEditingLogin(login);
        form.reset({
          login: login.login,
          emailAddress: login.emailAddress,
          phoneNumber: login.phoneNumber || '',
          fullName: login.fullName,
          forceChangePassword: login.forceChangePassword,
          preferredLanguage: login.preferredLanguage,
        });
        setIsFormOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (login) => setDeletingLogin(login),
    },
  ];

  const handleSubmit = async (data: SecurityLoginFormData) => {
    const loginData = {
      ...data,
      phoneNumber: data.phoneNumber || null,
    };

    if (editingLogin) {
      await updateApi.execute(editingLogin.id, loginData);
    } else {
      await createApi.execute(loginData);
    }
  };

  const handleDelete = async () => {
    if (deletingLogin) {
      await deleteApi.execute(deletingLogin.id);
    }
  };

  const openAddForm = () => {
    setEditingLogin(null);
    form.reset();
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Logins</h1>
        <p className="text-gray-600">Manage user login accounts and authentication settings</p>
      </div>

      <DataTable
        title="Security Logins"
        data={filteredLogins}
        columns={columns}
        actions={actions}
        onAdd={openAddForm}
        onSearch={setSearchTerm}
        isLoading={loginsApi.isLoading}
        searchPlaceholder="Search by login, email, or name..."
        emptyMessage="No security logins found"
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingLogin(null);
          form.reset();
        }}
        title={editingLogin ? 'Edit Security Login' : 'Add Security Login'}
        onSubmit={form.handleSubmit(handleSubmit)}
        isLoading={createApi.isLoading || updateApi.isLoading}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="login">Login ID *</Label>
            <Input
              id="login"
              {...form.register('login')}
              placeholder="Enter unique login ID"
            />
            {form.formState.errors.login && (
              <p className="text-sm text-red-600">{form.formState.errors.login.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              {...form.register('fullName')}
              placeholder="Enter full name"
            />
            {form.formState.errors.fullName && (
              <p className="text-sm text-red-600">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailAddress">Email Address *</Label>
            <Input
              id="emailAddress"
              type="email"
              {...form.register('emailAddress')}
              placeholder="Enter email address"
            />
            {form.formState.errors.emailAddress && (
              <p className="text-sm text-red-600">{form.formState.errors.emailAddress.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              {...form.register('phoneNumber')}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredLanguage">Preferred Language *</Label>
            <Select
              value={form.watch('preferredLanguage')}
              onValueChange={(value) => form.setValue('preferredLanguage', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languagesApi.data.map((language) => (
                  <SelectItem key={language.languageId} value={language.languageId}>
                    {language.name} ({language.nativeName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.preferredLanguage && (
              <p className="text-sm text-red-600">{form.formState.errors.preferredLanguage.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Force Password Change</Label>
                <p className="text-sm text-gray-600">
                  Require user to change password on next login
                </p>
              </div>
              <Switch
                checked={form.watch('forceChangePassword')}
                onCheckedChange={(checked) => form.setValue('forceChangePassword', checked)}
              />
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingLogin} onOpenChange={() => setDeletingLogin(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the login account for{' '}
              <strong>{deletingLogin?.fullName}</strong> ({deletingLogin?.login}).
              <br /><br />
              <strong>Warning:</strong> This may affect user access and related records.
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
