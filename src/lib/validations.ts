/**
 * Esquemas de validación con Zod para Armonía
 * Validaciones de formularios, APIs y datos de entrada
 */

import { z } from 'zod';
import { RolUsuario, PlanTipo, TipoDocumento } from '@prisma/client';

// =============================================
// VALIDACIONES DE AUTENTICACIÓN
// =============================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido')
    .max(255, 'El email es demasiado largo'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),
  remember: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido')
    .max(255, 'El email es demasiado largo'),
  telefono: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[\d\s\-\(\)]{7,20}$/.test(val), {
      message: 'Formato de teléfono inválido',
    }),
  nombreCompleto: z
    .string()
    .min(1, 'El nombre completo es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es demasiado larga')
    .regex(/(?=.*[a-z])/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/(?=.*[A-Z])/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/(?=.*\d)/, 'La contraseña debe contener al menos un número')
    .regex(/(?=.*[@$!%*?&])/, 'La contraseña debe contener al menos un carácter especial'),
  confirmPassword: z.string(),
  rol: z.nativeEnum(RolUsuario).optional(),
  conjuntoId: z.string().cuid().optional(),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Debe aceptar los términos y condiciones',
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es demasiado larga')
    .regex(/(?=.*[a-z])/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/(?=.*[A-Z])/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/(?=.*\d)/, 'La contraseña debe contener al menos un número')
    .regex(/(?=.*[@$!%*?&])/, 'La contraseña debe contener al menos un carácter especial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es demasiado larga')
    .regex(/(?=.*[a-z])/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/(?=.*[A-Z])/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/(?=.*\d)/, 'La contraseña debe contener al menos un número')
    .regex(/(?=.*[@$!%*?&])/, 'La contraseña debe contener al menos un carácter especial'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword'],
});

// =============================================
// VALIDACIONES DE CONJUNTO RESIDENCIAL
// =============================================

export const conjuntoResidencialSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  nit: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{9}-\d{1}$/.test(val), {
      message: 'Formato de NIT inválido (ej: 123456789-1)',
    }),
  direccion: z
    .string()
    .min(1, 'La dirección es requerida')
    .max(200, 'La dirección es demasiado larga'),
  telefono: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[\d\s\-\(\)]{7,20}$/.test(val), {
      message: 'Formato de teléfono inválido',
    }),
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Formato de email inválido',
    }),
  sitioWeb: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: 'Formato de URL inválido',
    }),
  representanteLegal: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 3, {
      message: 'El nombre del representante debe tener al menos 3 caracteres',
    }),
  plan: z.nativeEnum(PlanTipo),
  maxUnidades: z
    .number()
    .int()
    .min(1, 'Debe tener al menos 1 unidad')
    .max(1000, 'Máximo 1000 unidades'),
});

// =============================================
// VALIDACIONES DE USUARIOS
// =============================================

export const usuarioSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido')
    .max(255, 'El email es demasiado largo'),
  telefono: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[\d\s\-\(\)]{7,20}$/.test(val), {
      message: 'Formato de teléfono inválido',
    }),
  nombreCompleto: z
    .string()
    .min(1, 'El nombre completo es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  rol: z.nativeEnum(RolUsuario),
  activo: z.boolean().optional(),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: 'La contraseña debe tener al menos 8 caracteres',
    }),
});

export const updateUsuarioSchema = usuarioSchema.partial().extend({
  id: z.string().cuid('ID de usuario inválido'),
});

// =============================================
// VALIDACIONES DE PROPIEDADES
// =============================================

export const propiedadSchema = z.object({
  numero: z
    .string()
    .min(1, 'El número es requerido')
    .max(20, 'El número es demasiado largo')
    .regex(/^[A-Za-z0-9\-]+$/, 'El número solo puede contener letras, números y guiones'),
  bloque: z
    .string()
    .optional()
    .refine((val) => !val || /^[A-Za-z0-9\-\s]{1,10}$/.test(val), {
      message: 'El bloque debe tener máximo 10 caracteres alfanuméricos',
    }),
  tipo: z.enum(['APARTAMENTO', 'CASA', 'LOCAL_COMERCIAL', 'PARQUEADERO', 'DEPOSITO']),
  area: z
    .number()
    .positive('El área debe ser positiva')
    .max(10000, 'El área es demasiado grande')
    .optional(),
  valor: z
    .number()
    .positive('El valor debe ser positivo')
    .max(999999999999, 'El valor es demasiado grande')
    .optional(),
  coeficiente: z
    .number()
    .min(0, 'El coeficiente no puede ser negativo')
    .max(100, 'El coeficiente no puede ser mayor a 100')
    .optional(),
});

// =============================================
// VALIDACIONES DE RESIDENTES Y PROPIETARIOS
// =============================================

export const personaSchema = z.object({
  numeroDocumento: z
    .string()
    .min(1, 'El número de documento es requerido')
    .max(20, 'El número de documento es demasiado largo')
    .regex(/^[A-Za-z0-9]+$/, 'El documento solo puede contener letras y números'),
  tipoDocumento: z.nativeEnum(TipoDocumento),
  nombreCompleto: z
    .string()
    .min(1, 'El nombre completo es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  telefono: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[\d\s\-\(\)]{7,20}$/.test(val), {
      message: 'Formato de teléfono inválido',
    }),
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Formato de email inválido',
    }),
  direccion: z.string().max(200, 'La dirección es demasiado larga').optional(),
  fechaNacimiento: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Fecha de nacimiento inválida',
    }),
});

export const propietarioSchema = personaSchema;
export const residenteSchema = personaSchema;

// =============================================
// VALIDACIONES DE PQR
// =============================================

export const pqrSchema = z.object({
  titulo: z
    .string()
    .min(1, 'El título es requerido')
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título es demasiado largo'),
  descripcion: z
    .string()
    .min(1, 'La descripción es requerida')
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción es demasiado larga'),
  tipo: z.enum(['PETICION', 'QUEJA', 'RECLAMO', 'SUGERENCIA']),
  categoria: z.enum([
    'MANTENIMIENTO',
    'SEGURIDAD',
    'ADMINISTRACION',
    'FINANZAS',
    'CONVIVENCIA',
    'SERVICIOS_PUBLICOS',
    'OTRO'
  ]),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']).optional(),
  propiedadId: z.string().cuid().optional(),
});

export const respuestaPqrSchema = z.object({
  respuesta: z
    .string()
    .min(1, 'La respuesta es requerida')
    .min(10, 'La respuesta debe tener al menos 10 caracteres')
    .max(2000, 'La respuesta es demasiado larga'),
  estado: z.enum(['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'CERRADO', 'CANCELADO']).optional(),
});

// =============================================
// VALIDACIONES DE SERVICIOS Y RESERVAS
// =============================================

export const servicioComunSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  descripcion: z
    .string()
    .max(500, 'La descripción es demasiado larga')
    .optional(),
  capacidad: z
    .number()
    .int()
    .positive('La capacidad debe ser positiva')
    .max(1000, 'La capacidad es demasiado grande')
    .optional(),
  costo: z
    .number()
    .min(0, 'El costo no puede ser negativo')
    .max(9999999, 'El costo es demasiado grande'),
  requiereReserva: z.boolean(),
  horaInicio: z
    .string()
    .optional()
    .refine((val) => !val || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val), {
      message: 'Formato de hora inválido (HH:MM)',
    }),
  horaFin: z
    .string()
    .optional()
    .refine((val) => !val || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val), {
      message: 'Formato de hora inválido (HH:MM)',
    }),
  diasDisponibles: z
    .array(z.enum(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']))
    .optional(),
  tiempoMinimo: z
    .number()
    .int()
    .positive('El tiempo mínimo debe ser positivo')
    .max(1440, 'El tiempo mínimo no puede ser mayor a 24 horas')
    .optional(),
  tiempoMaximo: z
    .number()
    .int()
    .positive('El tiempo máximo debe ser positivo')
    .max(1440, 'El tiempo máximo no puede ser mayor a 24 horas')
    .optional(),
  anticipacion: z
    .number()
    .int()
    .min(0, 'La anticipación no puede ser negativa')
    .max(168, 'La anticipación no puede ser mayor a 168 horas (1 semana)')
    .optional(),
});

export const reservaSchema = z.object({
  servicioId: z.string().cuid('ID de servicio inválido'),
  propiedadId: z.string().cuid('ID de propiedad inválido'),
  fechaInicio: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Fecha de inicio inválida',
    }),
  fechaFin: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Fecha de fin inválida',
    }),
  numeroPersonas: z
    .number()
    .int()
    .positive('El número de personas debe ser positivo')
    .max(1000, 'El número de personas es demasiado grande'),
  observaciones: z
    .string()
    .max(500, 'Las observaciones son demasiado largas')
    .optional(),
}).refine((data) => {
  const inicio = new Date(data.fechaInicio);
  const fin = new Date(data.fechaFin);
  return inicio < fin;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['fechaFin'],
});

// =============================================
// VALIDACIONES DE ARCHIVOS
// =============================================

export const archivoSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre del archivo es requerido')
    .max(255, 'El nombre del archivo es demasiado largo'),
  tamaño: z
    .number()
    .int()
    .positive('El tamaño debe ser positivo')
    .max(10 * 1024 * 1024, 'El archivo no puede ser mayor a 10MB'), // 10MB
  tipoMime: z
    .string()
    .min(1, 'El tipo MIME es requerido')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/, {
      message: 'Tipo MIME inválido',
    }),
});

// =============================================
// VALIDACIONES DE BÚSQUEDA Y FILTROS
// =============================================

export const searchSchema = z.object({
  query: z.string().max(100, 'La búsqueda es demasiado larga').optional(),
  page: z
    .number()
    .int()
    .positive('La página debe ser positiva')
    .max(1000, 'Página demasiado alta')
    .optional()
    .default(1),
  limit: z
    .number()
    .int()
    .positive('El límite debe ser positivo')
    .max(100, 'El límite máximo es 100')
    .optional()
    .default(10),
  sortBy: z.string().max(50, 'Campo de ordenamiento inválido').optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const dateRangeSchema = z.object({
  fechaInicio: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Fecha de inicio inválida',
    }),
  fechaFin: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Fecha de fin inválida',
    }),
}).refine((data) => {
  if (!data.fechaInicio || !data.fechaFin) return true;
  const inicio = new Date(data.fechaInicio);
  const fin = new Date(data.fechaFin);
  return inicio <= fin;
}, {
  message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
  path: ['fechaFin'],
});

// =============================================
// TIPOS DERIVADOS DE LOS ESQUEMAS
// =============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type ConjuntoResidencialInput = z.infer<typeof conjuntoResidencialSchema>;
export type UsuarioInput = z.infer<typeof usuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;

export type PropiedadInput = z.infer<typeof propiedadSchema>;
export type PropietarioInput = z.infer<typeof propietarioSchema>;
export type ResidenteInput = z.infer<typeof residenteSchema>;

export type PQRInput = z.infer<typeof pqrSchema>;
export type RespuestaPQRInput = z.infer<typeof respuestaPqrSchema>;

export type ServicioComunInput = z.infer<typeof servicioComunSchema>;
export type ReservaInput = z.infer<typeof reservaSchema>;

export type ArchivoInput = z.infer<typeof archivoSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
