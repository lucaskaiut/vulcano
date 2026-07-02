import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Link, Navigate, useNavigate, useParams } from '@tanstack/react-router'
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { applyApiErrors } from "../lib/applyApiErrors";
import { formatSalary, maskCep, maskCnpj, maskCpf, maskPhone, toInputDate } from "../lib/format";
import * as aclService from "../services/aclService";
import { ApiError } from "../services/api";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DatePicker } from "../components/ui/DatePicker";
import { FormActions } from "../components/ui/FormActions";
import { Input } from "../components/ui/Input";
import { MultiSelect } from "../components/ui/MultiSelect";
import { PageHeader } from "../components/ui/PageHeader";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { CurrencyInput } from "../components/ui/CurrencyInput";
import { UserSalaryHistorySection } from "../components/users/UserSalaryHistorySection";
import { SearchSelect } from "../components/ui/SearchSelect";
import { UserVacationSection } from "../components/users/UserVacationSection";
import { UserDocumentsSection } from "../components/users/UserDocumentsSection";
import { UserInvoicesSection } from "../components/users/UserInvoicesSection";
import { UserMedicalExamsSection } from "../components/users/UserMedicalExamsSection";

const STATES = [
  { value: "AC", label: "AC" }, { value: "AL", label: "AL" }, { value: "AP", label: "AP" },
  { value: "AM", label: "AM" }, { value: "BA", label: "BA" }, { value: "CE", label: "CE" },
  { value: "DF", label: "DF" }, { value: "ES", label: "ES" }, { value: "GO", label: "GO" },
  { value: "MA", label: "MA" }, { value: "MT", label: "MT" }, { value: "MS", label: "MS" },
  { value: "MG", label: "MG" }, { value: "PA", label: "PA" }, { value: "PB", label: "PB" },
  { value: "PR", label: "PR" }, { value: "PE", label: "PE" }, { value: "PI", label: "PI" },
  { value: "RJ", label: "RJ" }, { value: "RN", label: "RN" }, { value: "RS", label: "RS" },
  { value: "RO", label: "RO" }, { value: "RR", label: "RR" }, { value: "SC", label: "SC" },
  { value: "SP", label: "SP" }, { value: "SE", label: "SE" }, { value: "TO", label: "TO" },
];

const CONTRACT_TYPES = [
  { value: "clt", label: "CLT" },
  { value: "pj", label: "PJ" },
  { value: "hybrid", label: "Híbrido" },
  { value: "other", label: "Outros" },
];

const benefitSchema = z.object({
  name: z.string().min(1, "Informe o nome do benefício."),
  price: z.number().min(0, "Valor inválido."),
});

const userFormSchema = z.object({
  name: z.string().min(1, "Informe o nome."),
  job_title: z.string().min(1, "Informe o cargo."),
  hired_at: z.string().min(1, "Informe a data de contratação."),
  manager_id: z.number().nullable(),
  sector_id: z.number().nullable(),
  salary: z.number().min(0, "A remuneração deve ser maior ou igual a zero.").optional(),
  email: z.string().min(1, "Informe o e-mail.").email("Informe um e-mail válido."),
  password: z.string().optional(),
  role_ids: z.array(z.number()),
  company_name: z.string().nullable().optional(),
  cnpj: z.string().nullable().optional(),
  cpf: z.string().nullable().optional(),
  rg: z.string().nullable().optional(),
  birth_date: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  zip_code: z.string().nullable().optional(),
  street: z.string().nullable().optional(),
  number: z.string().nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  contract_type: z.string().nullable().optional(),
  contracting_company: z.string().nullable().optional(),
  emergency_contacts: z.string().nullable().optional(),
  bank_details: z.string().nullable().optional(),
  observations: z.string().nullable().optional(),
  benefits: z.array(benefitSchema),
});

type UserFormValues = z.infer<typeof userFormSchema>;

function createUserFormSchema(isEditing: boolean) {
  return userFormSchema.superRefine((values, context) => {
    if (!isEditing && values.salary === undefined) {
      context.addIssue({ code: "custom", message: "Informe a remuneração.", path: ["salary"] });
    }
    if (!isEditing && (!values.password || values.password.length < 8)) {
      context.addIssue({ code: "custom", message: "A senha deve ter no mínimo 8 caracteres.", path: ["password"] });
    }
    if (isEditing && values.password && values.password.length < 8) {
      context.addIssue({ code: "custom", message: "A senha deve ter no mínimo 8 caracteres.", path: ["password"] });
    }
  });
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">{children}</h2>
}

export function UserFormPage() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = id ? Number(id) : null;
  const isEditing = userId !== null && !Number.isNaN(userId);
  const [formError, setFormError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const numberInputRef = useRef<HTMLInputElement | null>(null);

  const userQuery = useQuery({
    queryKey: ["users", userId],
    queryFn: () => aclService.getUser(userId!),
    enabled: isEditing,
  });

  const rolesQuery = useQuery({
    queryKey: ["roles", "name:asc"],
    queryFn: () => aclService.listRoles({ sorts: [{ column: "name", direction: "asc" }], per_page: 50 }),
  });

  const searchManagers = useCallback(async (query: string) => {
    const response = await aclService.listUsers({
      filters: { search: query.trim() === "" ? undefined : query, exclude_id: userId ?? undefined },
      sorts: [{ column: "name", direction: "asc" }],
      per_page: 15,
    });
    return response.data.map((c) => ({ value: c.id, label: c.name, description: c.job_title }));
  }, [userId]);

  const searchSectors = useCallback(async (query: string) => {
    const sectors = await aclService.listSectors();
    const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return sectors
      .filter((s) => {
        if (query.trim() === "") return true;
        return s.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedQuery);
      })
      .map((s) => ({ value: s.id, label: s.name }));
  }, []);

  const schema = useMemo(() => createUserFormSchema(isEditing), [isEditing]);

  const defaultBenefits = useMemo(() => {
    if (!isEditing || !userQuery.data?.benefits) return []
    return userQuery.data.benefits.map((b) => ({
      name: b.name,
      price: Number(b.price),
    }))
  }, [isEditing, userQuery.data?.benefits])

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", job_title: "", hired_at: "", manager_id: null, sector_id: null,
      salary: 0, email: "", password: "", role_ids: [],
      company_name: null, cnpj: null, cpf: null, rg: null, birth_date: null, phone: null,
      zip_code: null, street: null, number: null, neighborhood: null, city: null, state: null,
      contract_type: null, contracting_company: null,
      emergency_contacts: null, bank_details: null, observations: null,
      benefits: [],
    } satisfies UserFormValues,
  });

  const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({
    control,
    name: "benefits",
  });

  const handleCepBlur = useCallback(async () => {
    const cep = getValues("zip_code")?.replace(/\D/g, "");
    if (!cep || cep.length !== 8) return;

    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setValue("street", data.logradouro ?? "");
        setValue("neighborhood", data.bairro ?? "");
        setValue("city", data.localidade ?? "");
        setValue("state", data.uf ?? "");
      }
    } finally {
      setCepLoading(false);
      setTimeout(() => numberInputRef.current?.focus(), 0);
    }
  }, [getValues, setValue]);

  useEffect(() => {
    if (!isEditing || !userQuery.data) return;
    reset({
      name: userQuery.data.name,
      job_title: userQuery.data.job_title,
      hired_at: toInputDate(userQuery.data.hired_at),
      manager_id: userQuery.data.manager_id,
      sector_id: userQuery.data.sector_id,
      salary: Number(userQuery.data.salary),
      email: userQuery.data.email,
      password: "",
      role_ids: userQuery.data.roles?.map((r) => r.id) ?? [],
      company_name: userQuery.data.company_name,
      cnpj: userQuery.data.cnpj,
      cpf: userQuery.data.cpf,
      rg: userQuery.data.rg,
      birth_date: userQuery.data.birth_date ? toInputDate(userQuery.data.birth_date) : null,
      phone: userQuery.data.phone,
      zip_code: userQuery.data.zip_code,
      street: userQuery.data.street,
      number: userQuery.data.number,
      neighborhood: userQuery.data.neighborhood,
      city: userQuery.data.city,
      state: userQuery.data.state,
      contract_type: userQuery.data.contract_type,
      contracting_company: userQuery.data.contracting_company,
      emergency_contacts: userQuery.data.emergency_contacts,
      bank_details: userQuery.data.bank_details,
      observations: userQuery.data.observations,
      benefits: defaultBenefits,
    });
  }, [isEditing, userQuery.data, reset, defaultBenefits]);

  const saveMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const payload = {
        name: values.name,
        job_title: values.job_title,
        hired_at: values.hired_at,
        manager_id: values.manager_id,
        sector_id: values.sector_id,
        email: values.email,
        role_ids: values.role_ids,
        company_name: values.company_name,
        cnpj: values.cnpj,
        cpf: values.cpf,
        rg: values.rg,
        birth_date: values.birth_date,
        phone: values.phone,
        zip_code: values.zip_code,
        street: values.street,
        number: values.number,
        neighborhood: values.neighborhood,
        city: values.city,
        state: values.state,
        contract_type: values.contract_type,
        contracting_company: values.contracting_company,
        emergency_contacts: values.emergency_contacts,
        bank_details: values.bank_details,
        observations: values.observations,
        benefits: values.benefits.map((b) => ({ name: b.name, price: b.price })),
      };

      if (isEditing && userId) {
        return aclService.updateUser(userId, { ...payload, password: values.password || undefined });
      }
      return aclService.createUser({ ...payload, salary: values.salary ?? 0, password: values.password! });
    },
    onSuccess: async (savedUser) => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate({ to: `/users/${savedUser.id}` });
    },
    onError: (error) => {
      setFormError(null);
      if (error instanceof ApiError) {
        const message = applyApiErrors(error, setError, "Não foi possível salvar o colaborador.");
        if (message) setFormError(message);
        return;
      }
      setFormError("Não foi possível salvar o colaborador.");
    },
  });

  const roleOptions = useMemo(
    () => (rolesQuery.data?.data ?? []).map((r) => ({ value: r.id, label: r.name, description: r.description ?? undefined })),
    [rolesQuery.data],
  );

  const selectedManager = useMemo(() => {
    if (!userQuery.data?.manager) return null;
    return { value: userQuery.data.manager.id, label: userQuery.data.manager.name, description: userQuery.data.manager.job_title };
  }, [userQuery.data?.manager]);

  const selectedSector = useMemo(() => {
    if (!userQuery.data?.sector) return null;
    return { value: userQuery.data.sector.id, label: userQuery.data.sector.name };
  }, [userQuery.data?.sector]);

  if (isEditing && userQuery.isLoading) return <p className="text-sm text-foreground-muted">Carregando colaborador...</p>;
  if (isEditing && userQuery.isError) return (
    <div className="space-y-4">
      <Alert variant="danger">Colaborador não encontrado.</Alert>
      <Link to="/users" className="text-sm text-primary hover:underline">Voltar para colaboradores</Link>
    </div>
  );
  if (id && Number.isNaN(userId)) return <Navigate to="/users" replace />;

  return (
    <div>
      <PageHeader
        title={isEditing ? "Editar colaborador" : "Novo colaborador"}
        description={isEditing ? "Atualize os dados do colaborador." : "Cadastre um novo colaborador."}
      />

      <form className="space-y-4" onSubmit={handleSubmit((values) => saveMutation.mutate(values))} noValidate>
        {/* Dados Básicos */}
        <Card className="p-6">
          <SectionTitle>Dados Básicos</SectionTitle>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input label="Nome" error={errors.name?.message} {...register("name")} />
            <Input label="Cargo" error={errors.job_title?.message} {...register("job_title")} />
            <Controller name="hired_at" control={control} render={({ field }) => (
              <DatePicker label="Contratação" value={field.value} onChange={field.onChange} error={errors.hired_at?.message} />
            )} />
            {!isEditing && (
              <Controller name="salary" control={control} render={({ field }) => (
                <CurrencyInput label="Remuneração" value={field.value ?? 0} onChange={field.onChange} error={errors.salary?.message} />
              )} />
            )}
          </div>
          {!isEditing && <p className="mt-3 text-sm text-foreground-muted">O salário inicial será registrado automaticamente no histórico salarial.</p>}
          {isEditing && userQuery.data && (
            <div className="mt-3 rounded-lg border border-surface-sunken bg-surface-sunken/30 px-4 py-3">
              <p className="text-sm text-foreground-muted">Remuneração atual: <span className="font-semibold text-foreground">{formatSalary(userQuery.data.salary)}</span></p>
              <p className="mt-1 text-xs text-foreground-subtle">Para alterar, registre um reajuste no histórico abaixo.</p>
            </div>
          )}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
            <Input label={isEditing ? "Nova senha (opcional)" : "Senha"} type="password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
          </div>
        </Card>

        {/* Dados Pessoais */}
        <Card className="p-6">
          <SectionTitle>Dados Pessoais</SectionTitle>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input label="CPF" error={errors.cpf?.message} {...register("cpf", {
              onChange: (e) => { e.target.value = maskCpf(e.target.value) },
            })} placeholder="000.000.000-00" />
            <Input label="RG" error={errors.rg?.message} {...register("rg")} />
            <Controller name="birth_date" control={control} render={({ field }) => (
              <DatePicker label="Data de nascimento" value={field.value ?? ""} onChange={field.onChange} error={errors.birth_date?.message} />
            )} />
            <Input label="Telefone" error={errors.phone?.message} {...register("phone", {
              onChange: (e) => { e.target.value = maskPhone(e.target.value) },
            })} placeholder="(00) 00000-0000" />
          </div>
        </Card>

        {/* Dados Profissionais */}
        <Card className="p-6">
          <SectionTitle>Dados Profissionais</SectionTitle>
          <div className="mt-4 space-y-4">
            <Controller name="manager_id" control={control} render={({ field }) => (
              <SearchSelect label="Gestor" value={field.value} onChange={field.onChange} onSearch={searchManagers} selectedOption={selectedManager}
                placeholder="Selecione o gestor" searchPlaceholder="Buscar colaborador..." emptyMessage="Digite para buscar colaboradores."
                noResultsMessage="Nenhum colaborador encontrado." clearLabel="Sem gestor" error={errors.manager_id?.message} />
            )} />
            <Controller name="sector_id" control={control} render={({ field }) => (
              <SearchSelect label="Setor" value={field.value} onChange={field.onChange} onSearch={searchSectors} selectedOption={selectedSector}
                placeholder="Selecione o setor" searchPlaceholder="Buscar setor..." emptyMessage="Digite para buscar setores."
                noResultsMessage="Nenhum setor encontrado." clearLabel="Sem setor" error={errors.sector_id?.message} />
            )} />
            <div className="grid gap-4 md:grid-cols-2">
              <Controller name="contract_type" control={control} render={({ field }) => (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground-muted">Modalidade de contrato</label>
                  <Select options={CONTRACT_TYPES} value={field.value ?? ""} onChange={field.onChange} />
                  {errors.contract_type?.message && <p className="mt-1.5 text-sm text-danger">{errors.contract_type.message}</p>}
                </div>
              )} />
              <Input label="Empresa tomadora" error={errors.contracting_company?.message} {...register("contracting_company")} />
            </div>
          </div>
        </Card>

        {/* Dados da Empresa */}
        <Card className="p-6">
          <SectionTitle>Dados da Empresa</SectionTitle>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input label="Razão social" error={errors.company_name?.message} {...register("company_name")} />
            <Input label="CNPJ" error={errors.cnpj?.message} {...register("cnpj", {
              onChange: (e) => { e.target.value = maskCnpj(e.target.value) },
            })} placeholder="00.000.000/0000-00" />
          </div>
        </Card>

        {/* Endereço */}
        <Card className="p-6">
          <SectionTitle>Endereço</SectionTitle>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground-muted">
                CEP
                {cepLoading && (
                  <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-foreground-muted border-t-transparent" />
                )}
              </label>
              <input
                {...register("zip_code", {
                  onChange: (e) => { e.target.value = maskCep(e.target.value) },
                  onBlur: () => {
                    void handleCepBlur()
                  },
                })}
                placeholder="00000-000"
                className={`w-full rounded-lg bg-surface-sunken px-3 py-2.5 text-foreground shadow-inset outline-none placeholder:text-foreground-subtle focus:bg-surface focus:shadow-raised ${errors.zip_code?.message ? 'ring-2 ring-danger/30' : ''}`}
              />
              {errors.zip_code?.message && <p className="mt-1.5 text-sm text-danger">{errors.zip_code.message}</p>}
            </div>
            <div className="md:col-span-2">
              <Input label="Rua" error={errors.street?.message} {...register("street")} />
            </div>
            {(() => {
              const { ref: rRef, ...rRest } = register("number")
              return (
                <Input
                  label="Número"
                  error={errors.number?.message}
                  {...rRest}
                  ref={(el: HTMLInputElement | null) => { rRef(el); numberInputRef.current = el }}
                />
              )
            })()}
            <Input label="Bairro" error={errors.neighborhood?.message} {...register("neighborhood")} />
            <Input label="Cidade" error={errors.city?.message} {...register("city")} />
            <Controller name="state" control={control} render={({ field }) => (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground-muted">Estado</label>
                <Select options={STATES} value={field.value ?? ""} onChange={field.onChange} />
                {errors.state?.message && <p className="mt-1.5 text-sm text-danger">{errors.state.message}</p>}
              </div>
            )} />
          </div>
        </Card>

        {/* Benefícios */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <SectionTitle>Benefícios</SectionTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => appendBenefit({ name: "", price: 0 })}>
              <Plus className="size-4" />Adicionar
            </Button>
          </div>
          {benefitFields.length === 0 && (
            <p className="mt-3 text-sm text-foreground-subtle">Nenhum benefício adicionado.</p>
          )}
          <div className="mt-4 space-y-3">
            {benefitFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3">
                <div className="flex-1">
                  <Input
                    label={index === 0 ? "Nome" : ""}
                    error={errors.benefits?.[index]?.name?.message}
                    {...register(`benefits.${index}.name`)}
                    placeholder="Ex: Vale Alimentação"
                  />
                </div>
                <div className="w-36">
                  <Controller
                    name={`benefits.${index}.price`}
                    control={control}
                    render={({ field }) => (
                      <CurrencyInput
                        label={index === 0 ? "Valor (R$)" : undefined}
                        value={field.value as number ?? 0}
                        onChange={field.onChange}
                        error={errors.benefits?.[index]?.price?.message}
                      />
                    )}
                  />
                </div>
                <div className="pt-[26px]">
                  <Button type="button" variant="ghost" size="sm" aria-label="Remover" onClick={() => removeBenefit(index)}>
                    <Trash2 className="size-4 text-danger" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Adicionais */}
        <Card className="p-6">
          <SectionTitle>Adicionais</SectionTitle>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Textarea label="Dados bancários" error={errors.bank_details?.message} {...register("bank_details")} rows={3} />
            <Textarea label="Contatos de emergência" error={errors.emergency_contacts?.message} {...register("emergency_contacts")} rows={3} />
          </div>
          <div className="mt-4">
            <Textarea label="Observações" error={errors.observations?.message} {...register("observations")} rows={3} />
          </div>
        </Card>

        {/* Perfis */}
        <Card className="p-6">
          <SectionTitle>Perfis de Acesso</SectionTitle>
          <div className="mt-4">
            <Controller name="role_ids" control={control} render={({ field }) => (
              <MultiSelect label="Perfis" options={roleOptions} value={field.value} onChange={field.onChange}
                placeholder="Selecione os perfis" searchPlaceholder="Buscar perfil..." error={errors.role_ids?.message} />
            )} />
          </div>
        </Card>

        {formError && <Alert variant="danger">{formError}</Alert>}

        <FormActions cancelHref="/users" isSubmitting={isSubmitting || saveMutation.isPending} />
      </form>

      {isEditing && userId && userQuery.data && (
        <>
          <Card className="mt-4 p-6">
            <UserSalaryHistorySection userId={userId} currentSalary={userQuery.data.salary} />
          </Card>
          <Card className="mt-4 p-6">
            <UserVacationSection userId={userId} hireDate={userQuery.data?.hired_at} />
          </Card>
          <Card className="mt-4 p-6">
            <UserDocumentsSection userId={userId} />
          </Card>
          <Card className="mt-4 p-6">
            <UserInvoicesSection userId={userId} />
          </Card>
          <Card className="mt-4 p-6">
            <UserMedicalExamsSection userId={userId} />
          </Card>
        </>
      )}
    </div>
  );
}
