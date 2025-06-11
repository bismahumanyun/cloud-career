import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, TableColumn, TableAction } from '../common/DataTable';
import { FormModal } from '../common/FormModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useApi, useApiList } from '../../hooks/useApi';
import { applicantSkillService } from '../../services/api';
import { ApplicantSkill } from '../../types/entities';
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
import { Badge } from '../ui/badge';

const skillSchema = z.object({
  applicant: z.string().min(1, 'Applicant ID is required'),
  skill: z.string().min(1, 'Skill name is required'),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert'], {
    required_error: 'Skill level is required',
  }),
  startMonth: z.number().min(1).max(12).optional(),
  endMonth: z.number().min(1).max(12).optional(),
  startYear: z.number().min(1900).max(new Date().getFullYear()).optional(),
  endYear: z.number().min(1900).max(new Date().getFullYear() + 10).optional(),
});

type SkillFormData = z.infer<typeof skillSchema>;

const skillLevels = [
  { value: 'Beginner', label: 'Beginner', color: 'bg-red-100 text-red-800' },
  { value: 'Intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Advanced', label: 'Advanced', color: 'bg-blue-100 text-blue-800' },
  { value: 'Expert', label: 'Expert', color: 'bg-green-100 text-green-800' },
];

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export function ApplicantSkillsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<ApplicantSkill | null>(null);
  const [deletingSkill, setDeletingSkill] = useState<ApplicantSkill | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const skillsApi = useApiList(applicantSkillService.getAll);
  const createApi = useApi(applicantSkillService.create, {
    showSuccessToast: true,
    successMessage: 'Skill created successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      skillsApi.refresh();
      form.reset();
    },
  });
  const updateApi = useApi(applicantSkillService.update, {
    showSuccessToast: true,
    successMessage: 'Skill updated successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingSkill(null);
      skillsApi.refresh();
      form.reset();
    },
  });
  const deleteApi = useApi(applicantSkillService.delete, {
    showSuccessToast: true,
    successMessage: 'Skill deleted successfully',
    onSuccess: () => {
      setDeletingSkill(null);
      skillsApi.refresh();
    },
  });

  // Form setup
  const form = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      applicant: '',
      skill: '',
      skillLevel: 'Beginner',
      startMonth: undefined,
      endMonth: undefined,
      startYear: undefined,
      endYear: undefined,
    },
  });

  // Filter skills based on search term
  const filteredSkills = skillsApi.data.filter(skill =>
    skill.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.skillLevel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns: TableColumn<ApplicantSkill>[] = [
    {
      key: 'applicant',
      label: 'Applicant',
      sortable: true,
    },
    {
      key: 'skill',
      label: 'Skill',
      sortable: true,
    },
    {
      key: 'skillLevel',
      label: 'Level',
      render: (value) => {
        const levelConfig = skillLevels.find(level => level.value === value);
        return (
          <Badge className={levelConfig?.color || 'bg-gray-100 text-gray-800'}>
            {value}
          </Badge>
        );
      },
    },
    {
      key: 'startYear',
      label: 'Start',
      render: (value, item) => {
        if (!value) return '-';
        const month = item.startMonth ? months.find(m => m.value === item.startMonth)?.label.slice(0, 3) : '';
        return `${month} ${value}`.trim();
      },
    },
    {
      key: 'endYear',
      label: 'End',
      render: (value, item) => {
        if (!value) return 'Present';
        const month = item.endMonth ? months.find(m => m.value === item.endMonth)?.label.slice(0, 3) : '';
        return `${month} ${value}`.trim();
      },
    },
    {
      key: 'timeStamp',
      label: 'Added',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Table actions
  const actions: TableAction<ApplicantSkill>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (skill) => {
        setEditingSkill(skill);
        form.reset({
          applicant: skill.applicant,
          skill: skill.skill,
          skillLevel: skill.skillLevel as any,
          startMonth: skill.startMonth || undefined,
          endMonth: skill.endMonth || undefined,
          startYear: skill.startYear || undefined,
          endYear: skill.endYear || undefined,
        });
        setIsFormOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (skill) => setDeletingSkill(skill),
    },
  ];

  const handleSubmit = async (data: SkillFormData) => {
    const skillData = {
      ...data,
      startMonth: data.startMonth || null,
      endMonth: data.endMonth || null,
      startYear: data.startYear || null,
      endYear: data.endYear || null,
    };

    if (editingSkill) {
      await updateApi.execute(editingSkill.id, skillData);
    } else {
      await createApi.execute(skillData);
    }
  };

  const handleDelete = async () => {
    if (deletingSkill) {
      await deleteApi.execute(deletingSkill.id);
    }
  };

  const openAddForm = () => {
    setEditingSkill(null);
    form.reset();
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applicant Skills</h1>
        <p className="text-gray-600">Manage applicant skills and proficiency levels</p>
      </div>

      <DataTable
        title="Applicant Skills"
        data={filteredSkills}
        columns={columns}
        actions={actions}
        onAdd={openAddForm}
        onSearch={setSearchTerm}
        isLoading={skillsApi.isLoading}
        searchPlaceholder="Search by applicant, skill, or level..."
        emptyMessage="No applicant skills found"
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSkill(null);
          form.reset();
        }}
        title={editingSkill ? 'Edit Applicant Skill' : 'Add Applicant Skill'}
        onSubmit={form.handleSubmit(handleSubmit)}
        isLoading={createApi.isLoading || updateApi.isLoading}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="applicant">Applicant ID *</Label>
            <Input
              id="applicant"
              {...form.register('applicant')}
              placeholder="Enter applicant ID"
            />
            {form.formState.errors.applicant && (
              <p className="text-sm text-red-600">{form.formState.errors.applicant.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="skill">Skill *</Label>
            <Input
              id="skill"
              {...form.register('skill')}
              placeholder="e.g., JavaScript, Project Management"
            />
            {form.formState.errors.skill && (
              <p className="text-sm text-red-600">{form.formState.errors.skill.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="skillLevel">Skill Level *</Label>
            <Select
              value={form.watch('skillLevel')}
              onValueChange={(value) => form.setValue('skillLevel', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select skill level" />
              </SelectTrigger>
              <SelectContent>
                {skillLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${level.color.split(' ')[0]}`} />
                      <span>{level.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.skillLevel && (
              <p className="text-sm text-red-600">{form.formState.errors.skillLevel.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startMonth">Start Month</Label>
            <Select
              value={form.watch('startMonth')?.toString()}
              onValueChange={(value) => form.setValue('startMonth', value ? parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startYear">Start Year</Label>
            <Input
              id="startYear"
              type="number"
              {...form.register('startYear', { valueAsNumber: true })}
              placeholder="e.g., 2020"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endMonth">End Month</Label>
            <Select
              value={form.watch('endMonth')?.toString()}
              onValueChange={(value) => form.setValue('endMonth', value ? parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month (optional)" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endYear">End Year</Label>
            <Input
              id="endYear"
              type="number"
              {...form.register('endYear', { valueAsNumber: true })}
              placeholder="Leave empty if current"
              min="1900"
              max={new Date().getFullYear() + 10}
            />
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingSkill} onOpenChange={() => setDeletingSkill(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the skill{' '}
              <strong>{deletingSkill?.skill}</strong> for applicant{' '}
              <strong>{deletingSkill?.applicant}</strong>.
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
