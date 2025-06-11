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
import { companyLocationService, systemCountryCodeService } from '../../services/api';
import { CompanyLocation } from '../../types/entities';
import { Edit, Trash2, MapPin, Building2 } from 'lucide-react';
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

const locationSchema = z.object({
  company: z.string().min(1, 'Company ID is required'),
  countryCode: z.string().min(1, 'Country is required'),
  stateProvinceCode: z.string().optional(),
  streetAddress: z.string().optional(),
  cityTown: z.string().optional(),
  zipPostalCode: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

export function CompanyLocationsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<CompanyLocation | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<CompanyLocation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const locationsApi = useApiList(companyLocationService.getAll);
  const countriesApi = useApiList(systemCountryCodeService.getAll);
  const createApi = useApi(companyLocationService.create, {
    showSuccessToast: true,
    successMessage: 'Company location created successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      locationsApi.refresh();
      form.reset();
    },
  });
  const updateApi = useApi(companyLocationService.update, {
    showSuccessToast: true,
    successMessage: 'Company location updated successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingLocation(null);
      locationsApi.refresh();
      form.reset();
    },
  });
  const deleteApi = useApi(companyLocationService.delete, {
    showSuccessToast: true,
    successMessage: 'Company location deleted successfully',
    onSuccess: () => {
      setDeletingLocation(null);
      locationsApi.refresh();
    },
  });

  // Form setup
  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      company: '',
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

  // Filter locations based on search term
  const filteredLocations = locationsApi.data.filter(location =>
    location.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.cityTown?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.countryCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns: TableColumn<CompanyLocation>[] = [
    {
      key: 'company',
      label: 'Company ID',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'streetAddress',
      label: 'Address',
      render: (value, item) => (
        <div className="max-w-xs">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div>
              {value && <div className="text-sm">{value}</div>}
              <div className="text-sm text-gray-600">
                {item.cityTown}{item.stateProvinceCode && `, ${item.stateProvinceCode}`}
              </div>
              {item.zipPostalCode && (
                <div className="text-xs text-gray-500">{item.zipPostalCode}</div>
              )}
            </div>
          </div>
        </div>
      ),
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
  const actions: TableAction<CompanyLocation>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (location) => {
        setEditingLocation(location);
        form.reset({
          company: location.company,
          countryCode: location.countryCode,
          stateProvinceCode: location.stateProvinceCode || '',
          streetAddress: location.streetAddress || '',
          cityTown: location.cityTown || '',
          zipPostalCode: location.zipPostalCode || '',
        });
        setIsFormOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (location) => setDeletingLocation(location),
    },
  ];

  const handleSubmit = async (data: LocationFormData) => {
    const locationData = {
      ...data,
      stateProvinceCode: data.stateProvinceCode || null,
      streetAddress: data.streetAddress || null,
      cityTown: data.cityTown || null,
      zipPostalCode: data.zipPostalCode || null,
    };

    if (editingLocation) {
      await updateApi.execute(editingLocation.id, locationData);
    } else {
      await createApi.execute(locationData);
    }
  };

  const handleDelete = async () => {
    if (deletingLocation) {
      await deleteApi.execute(deletingLocation.id);
    }
  };

  const openAddForm = () => {
    setEditingLocation(null);
    form.reset();
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Locations</h1>
        <p className="text-gray-600">Manage company office locations and addresses</p>
      </div>

      <DataTable
        title="Company Locations"
        data={filteredLocations}
        columns={columns}
        actions={actions}
        onAdd={openAddForm}
        onSearch={setSearchTerm}
        isLoading={locationsApi.isLoading}
        searchPlaceholder="Search by company, city, or country..."
        emptyMessage="No company locations found"
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingLocation(null);
          form.reset();
        }}
        title={editingLocation ? 'Edit Company Location' : 'Add Company Location'}
        onSubmit={form.handleSubmit(handleSubmit)}
        isLoading={createApi.isLoading || updateApi.isLoading}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company ID *</Label>
            <Input
              id="company"
              {...form.register('company')}
              placeholder="e.g., company-tech-corp"
            />
            {form.formState.errors.company && (
              <p className="text-sm text-red-600">{form.formState.errors.company.message}</p>
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
            <Label htmlFor="stateProvinceCode">State/Province Code</Label>
            <Input
              id="stateProvinceCode"
              {...form.register('stateProvinceCode')}
              placeholder="e.g., CA, NY, ON"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
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
      <AlertDialog open={!!deletingLocation} onOpenChange={() => setDeletingLocation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the location for{' '}
              <strong>{deletingLocation?.company}</strong>
              {deletingLocation?.cityTown && (
                <span> in {deletingLocation.cityTown}</span>
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
