import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, TableColumn, TableAction } from '../common/DataTable';
import { FormModal } from '../common/FormModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useApi, useApiList } from '../../hooks/useApi';
import { companyProfileService } from '../../services/api';
import { CompanyProfile } from '../../types/entities';
import { Edit, Trash2, Building2, Globe, Phone, User, Image } from 'lucide-react';
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

const companyProfileSchema = z.object({
  registrationDate: z.string().min(1, 'Registration date is required'),
  companyWebsite: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  contactName: z.string().optional(),
  companyLogo: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;

export function CompanyProfilesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CompanyProfile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<CompanyProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const profilesApi = useApiList(companyProfileService.getAll);
  const createApi = useApi(companyProfileService.create, {
    showSuccessToast: true,
    successMessage: 'Company profile created successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      profilesApi.refresh();
      form.reset();
    },
  });
  const updateApi = useApi(companyProfileService.update, {
    showSuccessToast: true,
    successMessage: 'Company profile updated successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingProfile(null);
      profilesApi.refresh();
      form.reset();
    },
  });
  const deleteApi = useApi(companyProfileService.delete, {
    showSuccessToast: true,
    successMessage: 'Company profile deleted successfully',
    onSuccess: () => {
      setDeletingProfile(null);
      profilesApi.refresh();
    },
  });

  // Form setup
  const form = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      registrationDate: new Date().toISOString().split('T')[0],
      companyWebsite: '',
      contactPhone: '',
      contactName: '',
      companyLogo: '',
    },
  });

  // Filter profiles based on search term
  const filteredProfiles = profilesApi.data.filter(profile =>
    profile.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.companyWebsite?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns: TableColumn<CompanyProfile>[] = [
    {
      key: 'id',
      label: 'Company ID',
      sortable: true,
      width: '150px',
    },
    {
      key: 'contactName',
      label: 'Contact Person',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-500" />
          <span>{value || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'contactPhone',
      label: 'Phone',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span>{value || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'companyWebsite',
      label: 'Website',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-gray-500" />
          {value ? (
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {value.replace(/^https?:\/\//, '')}
            </a>
          ) : (
            <span>N/A</span>
          )}
        </div>
      ),
    },
    {
      key: 'companyLogo',
      label: 'Logo',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Image className="h-4 w-4 text-gray-500" />
          {value ? (
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View Logo
            </a>
          ) : (
            <span className="text-gray-500">None</span>
          )}
        </div>
      ),
    },
    {
      key: 'registrationDate',
      label: 'Registration Date',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'timeStamp',
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Table actions
  const actions: TableAction<CompanyProfile>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (profile) => {
        setEditingProfile(profile);
        form.reset({
          registrationDate: profile.registrationDate.split('T')[0],
          companyWebsite: profile.companyWebsite || '',
          contactPhone: profile.contactPhone || '',
          contactName: profile.contactName || '',
          companyLogo: profile.companyLogo || '',
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

  const handleSubmit = async (data: CompanyProfileFormData) => {
    const profileData = {
      ...data,
      registrationDate: new Date(data.registrationDate).toISOString(),
      companyWebsite: data.companyWebsite || null,
      contactPhone: data.contactPhone || null,
      contactName: data.contactName || null,
      companyLogo: data.companyLogo || null,
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
    form.reset({
      registrationDate: new Date().toISOString().split('T')[0],
      companyWebsite: '',
      contactPhone: '',
      contactName: '',
      companyLogo: '',
    });
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Profiles</h1>
        <p className="text-gray-600">Manage company profile information and contact details</p>
      </div>

      <DataTable
        title="Company Profiles"
        data={filteredProfiles}
        columns={columns}
        actions={actions}
        onAdd={openAddForm}
        onSearch={setSearchTerm}
        isLoading={profilesApi.isLoading}
        searchPlaceholder="Search by company ID, contact name, or website..."
        emptyMessage="No company profiles found"
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProfile(null);
          form.reset();
        }}
        title={editingProfile ? 'Edit Company Profile' : 'Add Company Profile'}
        onSubmit={form.handleSubmit(handleSubmit)}
        isLoading={createApi.isLoading || updateApi.isLoading}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="registrationDate">Registration Date *</Label>
            <Input
              id="registrationDate"
              type="date"
              {...form.register('registrationDate')}
            />
            {form.formState.errors.registrationDate && (
              <p className="text-sm text-red-600">{form.formState.errors.registrationDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Person</Label>
            <Input
              id="contactName"
              {...form.register('contactName')}
              placeholder="Enter contact person name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              type="tel"
              {...form.register('contactPhone')}
              placeholder="e.g., +1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyWebsite">Company Website</Label>
            <Input
              id="companyWebsite"
              type="url"
              {...form.register('companyWebsite')}
              placeholder="https://www.company.com"
            />
            {form.formState.errors.companyWebsite && (
              <p className="text-sm text-red-600">{form.formState.errors.companyWebsite.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyLogo">Company Logo URL</Label>
            <Input
              id="companyLogo"
              type="url"
              {...form.register('companyLogo')}
              placeholder="https://www.company.com/logo.png"
            />
            {form.formState.errors.companyLogo && (
              <p className="text-sm text-red-600">{form.formState.errors.companyLogo.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Enter the URL of your company logo image
            </p>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProfile} onOpenChange={() => setDeletingProfile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the company profile{' '}
              <strong>{deletingProfile?.id}</strong>
              {deletingProfile?.contactName && (
                <span> (Contact: {deletingProfile.contactName})</span>
              )}.
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
