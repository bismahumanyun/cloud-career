import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, TableColumn, TableAction } from '../common/DataTable';
import { FormModal } from '../common/FormModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useApi, useApiList } from '../../hooks/useApi';
import { systemCountryCodeService } from '../../services/api';
import { SystemCountryCode } from '../../types/entities';
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

const countrySchema = z.object({
  code: z.string().min(2, 'Country code must be at least 2 characters').max(3, 'Country code must be at most 3 characters'),
  name: z.string().min(1, 'Country name is required'),
});

type CountryFormData = z.infer<typeof countrySchema>;

export function CountryCodesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<SystemCountryCode | null>(null);
  const [deletingCountry, setDeletingCountry] = useState<SystemCountryCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const countriesApi = useApiList(systemCountryCodeService.getAll);
  const createApi = useApi(systemCountryCodeService.create, {
    showSuccessToast: true,
    successMessage: 'Country created successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      countriesApi.refresh();
      form.reset();
    },
  });
  const updateApi = useApi(systemCountryCodeService.update, {
    showSuccessToast: true,
    successMessage: 'Country updated successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingCountry(null);
      countriesApi.refresh();
      form.reset();
    },
  });
  const deleteApi = useApi(systemCountryCodeService.delete, {
    showSuccessToast: true,
    successMessage: 'Country deleted successfully',
    onSuccess: () => {
      setDeletingCountry(null);
      countriesApi.refresh();
    },
  });

  // Form setup
  const form = useForm<CountryFormData>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      code: '',
      name: '',
    },
  });

  // Filter countries based on search term
  const filteredCountries = countriesApi.data.filter(country =>
    country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns: TableColumn<SystemCountryCode>[] = [
    {
      key: 'code',
      label: 'Country Code',
      sortable: true,
      width: '150px',
    },
    {
      key: 'name',
      label: 'Country Name',
      sortable: true,
    },
  ];

  // Table actions
  const actions: TableAction<SystemCountryCode>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (country) => {
        setEditingCountry(country);
        form.reset({
          code: country.code,
          name: country.name,
        });
        setIsFormOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (country) => setDeletingCountry(country),
    },
  ];

  const handleSubmit = async (data: CountryFormData) => {
    if (editingCountry) {
      await updateApi.execute(editingCountry.code, data);
    } else {
      await createApi.execute(data);
    }
  };

  const handleDelete = async () => {
    if (deletingCountry) {
      await deleteApi.execute(deletingCountry.code);
    }
  };

  const openAddForm = () => {
    setEditingCountry(null);
    form.reset();
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Country Codes</h1>
        <p className="text-gray-600">Manage system country codes used throughout the application</p>
      </div>

      <DataTable
        title="Country Codes"
        data={filteredCountries}
        columns={columns}
        actions={actions}
        onAdd={openAddForm}
        onSearch={setSearchTerm}
        isLoading={countriesApi.isLoading}
        searchPlaceholder="Search by code or name..."
        emptyMessage="No country codes found"
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCountry(null);
          form.reset();
        }}
        title={editingCountry ? 'Edit Country Code' : 'Add Country Code'}
        onSubmit={form.handleSubmit(handleSubmit)}
        isLoading={createApi.isLoading || updateApi.isLoading}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Country Code *</Label>
            <Input
              id="code"
              {...form.register('code')}
              placeholder="e.g., US, CA, GB"
              className="uppercase"
              maxLength={3}
              disabled={!!editingCountry} // Disable editing code for existing countries
            />
            {form.formState.errors.code && (
              <p className="text-sm text-red-600">{form.formState.errors.code.message}</p>
            )}
            <p className="text-xs text-gray-500">
              ISO 3166-1 alpha-2 or alpha-3 country code
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Country Name *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Enter country name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCountry} onOpenChange={() => setDeletingCountry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the country code{' '}
              <strong>{deletingCountry?.code}</strong> ({deletingCountry?.name}).
              <br /><br />
              <strong>Warning:</strong> This may affect other records that reference this country.
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
