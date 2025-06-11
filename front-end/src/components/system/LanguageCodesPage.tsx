import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, TableColumn, TableAction } from '../common/DataTable';
import { FormModal } from '../common/FormModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useApi, useApiList } from '../../hooks/useApi';
import { systemLanguageCodeService } from '../../services/api';
import { SystemLanguageCode } from '../../types/entities';
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

const languageSchema = z.object({
  languageId: z.string().min(2, 'Language ID must be at least 2 characters').max(5, 'Language ID must be at most 5 characters'),
  name: z.string().min(1, 'Language name is required'),
  nativeName: z.string().min(1, 'Native name is required'),
});

type LanguageFormData = z.infer<typeof languageSchema>;

export function LanguageCodesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<SystemLanguageCode | null>(null);
  const [deletingLanguage, setDeletingLanguage] = useState<SystemLanguageCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const languagesApi = useApiList(systemLanguageCodeService.getAll);
  const createApi = useApi(systemLanguageCodeService.create, {
    showSuccessToast: true,
    successMessage: 'Language created successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      languagesApi.refresh();
      form.reset();
    },
  });
  const updateApi = useApi(systemLanguageCodeService.update, {
    showSuccessToast: true,
    successMessage: 'Language updated successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingLanguage(null);
      languagesApi.refresh();
      form.reset();
    },
  });
  const deleteApi = useApi(systemLanguageCodeService.delete, {
    showSuccessToast: true,
    successMessage: 'Language deleted successfully',
    onSuccess: () => {
      setDeletingLanguage(null);
      languagesApi.refresh();
    },
  });

  // Form setup
  const form = useForm<LanguageFormData>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      languageId: '',
      name: '',
      nativeName: '',
    },
  });

  // Filter languages based on search term
  const filteredLanguages = languagesApi.data.filter(language =>
    language.languageId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    language.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    language.nativeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns: TableColumn<SystemLanguageCode>[] = [
    {
      key: 'languageId',
      label: 'Language ID',
      sortable: true,
      width: '120px',
    },
    {
      key: 'name',
      label: 'English Name',
      sortable: true,
    },
    {
      key: 'nativeName',
      label: 'Native Name',
      sortable: true,
    },
  ];

  // Table actions
  const actions: TableAction<SystemLanguageCode>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (language) => {
        setEditingLanguage(language);
        form.reset({
          languageId: language.languageId,
          name: language.name,
          nativeName: language.nativeName,
        });
        setIsFormOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (language) => setDeletingLanguage(language),
    },
  ];

  const handleSubmit = async (data: LanguageFormData) => {
    if (editingLanguage) {
      await updateApi.execute(editingLanguage.languageId, data);
    } else {
      await createApi.execute(data);
    }
  };

  const handleDelete = async () => {
    if (deletingLanguage) {
      await deleteApi.execute(deletingLanguage.languageId);
    }
  };

  const openAddForm = () => {
    setEditingLanguage(null);
    form.reset();
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Language Codes</h1>
        <p className="text-gray-600">Manage system language codes for internationalization</p>
      </div>

      <DataTable
        title="Language Codes"
        data={filteredLanguages}
        columns={columns}
        actions={actions}
        onAdd={openAddForm}
        onSearch={setSearchTerm}
        isLoading={languagesApi.isLoading}
        searchPlaceholder="Search by ID, name, or native name..."
        emptyMessage="No language codes found"
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingLanguage(null);
          form.reset();
        }}
        title={editingLanguage ? 'Edit Language Code' : 'Add Language Code'}
        onSubmit={form.handleSubmit(handleSubmit)}
        isLoading={createApi.isLoading || updateApi.isLoading}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="languageId">Language ID *</Label>
            <Input
              id="languageId"
              {...form.register('languageId')}
              placeholder="e.g., en, es, fr, zh-CN"
              className="lowercase"
              maxLength={5}
              disabled={!!editingLanguage} // Disable editing ID for existing languages
            />
            {form.formState.errors.languageId && (
              <p className="text-sm text-red-600">{form.formState.errors.languageId.message}</p>
            )}
            <p className="text-xs text-gray-500">
              ISO 639-1 or IETF language tag (e.g., en, en-US, zh-CN)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">English Name *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Enter language name in English"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nativeName">Native Name *</Label>
            <Input
              id="nativeName"
              {...form.register('nativeName')}
              placeholder="Enter language name in its native script"
            />
            {form.formState.errors.nativeName && (
              <p className="text-sm text-red-600">{form.formState.errors.nativeName.message}</p>
            )}
            <p className="text-xs text-gray-500">
              How the language name appears in its own script
            </p>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingLanguage} onOpenChange={() => setDeletingLanguage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the language code{' '}
              <strong>{deletingLanguage?.languageId}</strong> ({deletingLanguage?.name}).
              <br /><br />
              <strong>Warning:</strong> This may affect other records that reference this language.
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
