import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, TableColumn, TableAction } from '../common/DataTable';
import { FormModal } from '../common/FormModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useApi, useApiList } from '../../hooks/useApi';
import { companyDescriptionService, systemLanguageCodeService } from '../../services/api';
import { CompanyDescription } from '../../types/entities';
import { Edit, Trash2, Globe, Building2 } from 'lucide-react';
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

const companyDescriptionSchema = z.object({
  company: z.string().min(1, 'Company ID is required'),
  languageId: z.string().min(1, 'Language is required'),
  companyName: z.string().min(1, 'Company name is required'),
  companyDescription: z.string().min(10, 'Description must be at least 10 characters'),
});

type CompanyDescriptionFormData = z.infer<typeof companyDescriptionSchema>;

export function CompanyDescriptionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDescription, setEditingDescription] = useState<CompanyDescription | null>(null);
  const [deletingDescription, setDeletingDescription] = useState<CompanyDescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const descriptionsApi = useApiList(companyDescriptionService.getAll);
  const languagesApi = useApiList(systemLanguageCodeService.getAll);
  const createApi = useApi(companyDescriptionService.create, {
    showSuccessToast: true,
    successMessage: 'Company description created successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      descriptionsApi.refresh();
      form.reset();
    },
  });
  const updateApi = useApi(companyDescriptionService.update, {
    showSuccessToast: true,
    successMessage: 'Company description updated successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingDescription(null);
      descriptionsApi.refresh();
      form.reset();
    },
  });
  const deleteApi = useApi(companyDescriptionService.delete, {
    showSuccessToast: true,
    successMessage: 'Company description deleted successfully',
    onSuccess: () => {
      setDeletingDescription(null);
      descriptionsApi.refresh();
    },
  });

  // Form setup
  const form = useForm<CompanyDescriptionFormData>({
    resolver: zodResolver(companyDescriptionSchema),
    defaultValues: {
      company: '',
      languageId: '',
      companyName: '',
      companyDescription: '',
    },
  });

  // Load languages on mount
  useEffect(() => {
    languagesApi.execute();
  }, []);

  // Filter descriptions based on search term
  const filteredDescriptions = descriptionsApi.data.filter(description =>
    description.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    description.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    description.companyDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns: TableColumn<CompanyDescription>[] = [
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
      key: 'companyName',
      label: 'Company Name',
      sortable: true,
    },
    {
      key: 'languageId',
      label: 'Language',
      render: (value) => {
        const language = languagesApi.data.find(l => l.languageId === value);
        return (
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <Badge variant="outline">
              {language ? `${language.name} (${language.nativeName})` : value}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'companyDescription',
      label: 'Description Preview',
      render: (value) => {
        const preview = value.substring(0, 80);
        return (
          <div className="max-w-xs">
            <p className="text-sm text-gray-700">
              {preview}...
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {value.length} characters
            </p>
          </div>
        );
      },
    },
    {
      key: 'timeStamp',
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Table actions
  const actions: TableAction<CompanyDescription>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (description) => {
        setEditingDescription(description);
        form.reset({
          company: description.company,
          languageId: description.languageId,
          companyName: description.companyName,
          companyDescription: description.companyDescription,
        });
        setIsFormOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (description) => setDeletingDescription(description),
    },
  ];

  const handleSubmit = async (data: CompanyDescriptionFormData) => {
    if (editingDescription) {
      await updateApi.execute(editingDescription.id, data);
    } else {
      await createApi.execute(data);
    }
  };

  const handleDelete = async () => {
    if (deletingDescription) {
      await deleteApi.execute(deletingDescription.id);
    }
  };

  const openAddForm = () => {
    setEditingDescription(null);
    form.reset();
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Descriptions</h1>
        <p className="text-gray-600">Manage multi-language company descriptions and information</p>
      </div>

      <DataTable
        title="Company Descriptions"
        data={filteredDescriptions}
        columns={columns}
        actions={actions}
        onAdd={openAddForm}
        onSearch={setSearchTerm}
        isLoading={descriptionsApi.isLoading}
        searchPlaceholder="Search by company, name, or description..."
        emptyMessage="No company descriptions found"
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDescription(null);
          form.reset();
        }}
        title={editingDescription ? 'Edit Company Description' : 'Add Company Description'}
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
            <Label htmlFor="languageId">Language *</Label>
            <Select
              value={form.watch('languageId')}
              onValueChange={(value) => form.setValue('languageId', value)}
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
            {form.formState.errors.languageId && (
              <p className="text-sm text-red-600">{form.formState.errors.languageId.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              {...form.register('companyName')}
              placeholder="Enter company name"
            />
            {form.formState.errors.companyName && (
              <p className="text-sm text-red-600">{form.formState.errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyDescription">Company Description *</Label>
            <Textarea
              id="companyDescription"
              {...form.register('companyDescription')}
              placeholder="Enter a detailed company description..."
              rows={6}
            />
            {form.formState.errors.companyDescription && (
              <p className="text-sm text-red-600">{form.formState.errors.companyDescription.message}</p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Characters: {form.watch('companyDescription')?.length || 0}
              </span>
              <span>
                Words: {form.watch('companyDescription')?.split(/\s+/).filter(w => w.length > 0).length || 0}
              </span>
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingDescription} onOpenChange={() => setDeletingDescription(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the description for{' '}
              <strong>{deletingDescription?.companyName}</strong> in{' '}
              <strong>{deletingDescription?.languageId}</strong>.
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
