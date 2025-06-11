import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, TableColumn, TableAction } from '../common/DataTable';
import { FormModal } from '../common/FormModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useApi, useApiList } from '../../hooks/useApi';
import { applicantProfileService, systemCountryCodeService } from '../../services/api';
import { ApplicantProfile, SystemCountryCode } from '../../types/entities';
import { Edit, Trash2 } from 'lucide-react';
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

const profileSchema = z.object({
  login: z.string().min(1, 'Login is required'),
  currentSalary: z.number().min(0).optional(),
  currentRate: z.number().min(0).optional(),
  currency: z.string().optional(),
  countryCode: z.string().min(1, 'Country is required'),
  stateProvinceCode: z.string().optional(),
  streetAddress: z.string().optional(),
  cityTown: z.string().optional(),
  zipPostalCode: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ApplicantProfilesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ApplicantProfile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<ApplicantProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const profilesApi = useApiList(applicantProfileService.getAll);
  const countriesApi = useApiList(systemCountryCodeService.getAll);
  const createApi = useApi(applicantProfileService.create, {
    showSuccessToast: true,
    successMessage: 'Profile created successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      profilesApi.refresh();
      form.reset();
    },
  });
  const updateApi = useApi(applicantProfileService.update, {
    showSuccessToast: true,
    successMessage: 'Profile updated successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingProfile(null);
      profilesApi.refresh();
      form.reset();
    },
  });
  const deleteApi = useApi(applicantProfileService.delete, {
    showSuccessToast: true,
    successMessage: 'Profile deleted successfully',
    onSuccess: () => {
      setDeletingProfile(null);
      profilesApi.refresh();
    },
  });

  // Form setup
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      login: '',
      currentSalary: undefined,
      currentRate: undefined,
      currency: '',
      countryCode: '',
      stateProvinceCode: '',
      streetAddress: '',
      cityTown: '',
      zipPostalCode: '',
    },
  });

  // Load countries on mount
  useEffect(() => {
    countriesApi.execute();
  }, []);

  // Filter profiles based on search term
  const filteredProfiles = profilesApi.data.filter(profile =>
    profile.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.cityTown?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.countryCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns: TableColumn<ApplicantProfile>[] = [
    {
      key: 'login',
      label: 'Login',
      sortable: true,
    },
    {
      key: 'currentSalary',
      label: 'Current Salary',
      render: (value, item) => value ? `${value} ${item.currency || ''}` : '-',
    },
    {
      key: 'currentRate',
      label: 'Current Rate',
      render: (value, item) => value ? `${value} ${item.currency || ''}/hr` : '-',
    },
    {
      key: 'cityTown',
      label: 'City',
    },
    {
      key: 'countryCode',
      label: 'Country',
      render: (value) => {
        const country = countriesApi.data.find(c => c.code === value);
        return country?.name || value;
      },
    },
    {
      key: 'timeStamp',
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Table actions
  const actions: TableAction<ApplicantProfile>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (profile) => {
        setEditingProfile(profile);
        form.reset({
          login: profile.login,
          currentSalary: profile.currentSalary || undefined,
          currentRate: profile.currentRate || undefined,
          currency: profile.currency || '',
          countryCode: profile.countryCode,
          stateProvinceCode: profile.stateProvinceCode || '',
          streetAddress: profile.streetAddress || '',
          cityTown: profile.cityTown || '',
          zipPostalCode: profile.zipPostalCode || '',
        });
        setIsFormOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (profile) => setDeletingProfile(profile),
    },
  ];

  const handleSubmit = async (data: ProfileFormData) => {
    const profileData = {
      ...data,
      currentSalary: data.currentSalary || null,
      currentRate: data.currentRate || null,
    };

    if (editingProfile) {
      await updateApi.execute(editingProfile.id, profileData);
    } else {
      await createApi.execute(profileData);
    }
  };

  const handleDelete = async () => {
    if (deletingProfile) {
      await deleteApi.execute(deletingProfile.id);
    }
  };

  const openAddForm = () => {
    setEditingProfile(null);
    form.reset();
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applicant Profiles</h1>
        <p className="text-gray-600">Manage applicant profile information and contact details</p>
      </div>

      <DataTable
        title="Applicant Profiles"
        data={filteredProfiles}
        columns={columns}
        actions={actions}
        onAdd={openAddForm}
        onSearch={setSearchTerm}
        isLoading={profilesApi.isLoading}
        searchPlaceholder="Search by login, city, or country..."
        emptyMessage="No applicant profiles found"
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProfile(null);
          form.reset();
        }}
        title={editingProfile ? 'Edit Applicant Profile' : 'Add Applicant Profile'}
        onSubmit={form.handleSubmit(handleSubmit)}
        isLoading={createApi.isLoading || updateApi.isLoading}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="login">Login *</Label>
            <Input
              id="login"
              {...form.register('login')}
              placeholder="Enter login"
            />
            {form.formState.errors.login && (
              <p className="text-sm text-red-600">{form.formState.errors.login.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryCode">Country *</Label>
            <Select
              value={form.watch('countryCode')}
              onValueChange={(value) => form.setValue('countryCode', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countriesApi.data.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.countryCode && (
              <p className="text-sm text-red-600">{form.formState.errors.countryCode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentSalary">Current Salary</Label>
            <Input
              id="currentSalary"
              type="number"
              {...form.register('currentSalary', { valueAsNumber: true })}
              placeholder="Enter current salary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentRate">Current Rate (per hour)</Label>
            <Input
              id="currentRate"
              type="number"
              {...form.register('currentRate', { valueAsNumber: true })}
              placeholder="Enter hourly rate"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              {...form.register('currency')}
              placeholder="e.g., USD, CAD, EUR"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stateProvinceCode">State/Province</Label>
            <Input
              id="stateProvinceCode"
              {...form.register('stateProvinceCode')}
              placeholder="Enter state or province code"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="streetAddress">Street Address</Label>
            <Input
              id="streetAddress"
              {...form.register('streetAddress')}
              placeholder="Enter street address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cityTown">City/Town</Label>
            <Input
              id="cityTown"
              {...form.register('cityTown')}
              placeholder="Enter city or town"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipPostalCode">ZIP/Postal Code</Label>
            <Input
              id="zipPostalCode"
              {...form.register('zipPostalCode')}
              placeholder="Enter ZIP or postal code"
            />
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProfile} onOpenChange={() => setDeletingProfile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the profile for{' '}
              <strong>{deletingProfile?.login}</strong>.
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
