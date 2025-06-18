/**
 * Cliente Prisma configurado para Multi-tenancy por esquemas
 * Armonía - Sistema de Administración de Conjuntos Residenciales
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Cliente Prisma principal (esquema público)
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// =============================================
// CONFIGURACIÓN MULTI-TENANT POR ESQUEMAS
// =============================================

/**
 * Cache de clientes Prisma por tenant
 */
const tenantClients = new Map<string, PrismaClient>();

/**
 * Obtiene un cliente Prisma específico para un tenant
 * @param tenantId - ID del tenant (formato: cj0001, cj0002, etc.)
 * @returns Cliente Prisma configurado para el esquema del tenant
 */
export function getTenantPrismaClient(tenantId: string): PrismaClient {
  // Validar formato del tenantId
  if (!tenantId.match(/^cj\d{4}$/)) {
    throw new Error(`ID de tenant inválido: ${tenantId}. Formato esperado: cjXXXX`);
  }

  const schemaName = `tenant_${tenantId}`;
  
  // Verificar si ya existe el cliente en cache
  if (tenantClients.has(schemaName)) {
    return tenantClients.get(schemaName)!;
  }

  // Crear nuevo cliente para el tenant
  const tenantClient = new PrismaClient({
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL}?schema=${schemaName}`,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Guardar en cache
  tenantClients.set(schemaName, tenantClient);
  
  return tenantClient;
}

/**
 * Genera el próximo ID de tenant disponible
 * @returns Próximo ID en formato cjXXXX
 */
export async function getNextTenantId(): Promise<string> {
  try {
    // Buscar el último conjunto creado
    const ultimoConjunto = await prisma.conjuntoResidencial.findFirst({
      orderBy: { fechaCreacion: 'desc' },
      select: { tenantId: true },
    });

    if (!ultimoConjunto) {
      return 'cj0001'; // Primer tenant
    }

    // Extraer número del último tenant y incrementar
    const ultimoNumero = parseInt(ultimoConjunto.tenantId.replace('cj', ''));
    const nuevoNumero = ultimoNumero + 1;
    
    return `cj${nuevoNumero.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error al generar siguiente tenant ID:', error);
    throw new Error('No se pudo generar el ID del tenant');
  }
}

/**
 * Crea un nuevo esquema para un tenant
 * @param tenantId - ID del tenant
 * @returns Resultado de la creación del esquema
 */
export async function createTenantSchema(tenantId: string): Promise<void> {
  const schemaName = `tenant_${tenantId}`;
  
  try {
    // Crear el esquema en PostgreSQL
    await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    
    // Obtener cliente del tenant para ejecutar migraciones
    const tenantClient = getTenantPrismaClient(tenantId);
    
    // Ejecutar las migraciones en el nuevo esquema
    // Nota: En producción, esto se manejará con migraciones de Prisma
    console.log(`Esquema ${schemaName} creado exitosamente`);
    
    return;
  } catch (error) {
    console.error(`Error al crear esquema para tenant ${tenantId}:`, error);
    throw new Error(`No se pudo crear el esquema para el tenant ${tenantId}`);
  }
}

/**
 * Elimina un esquema de tenant (usar con precaución)
 * @param tenantId - ID del tenant
 */
export async function deleteTenantSchema(tenantId: string): Promise<void> {
  const schemaName = `tenant_${tenantId}`;
  
  try {
    // Cerrar conexión del cliente si existe
    if (tenantClients.has(schemaName)) {
      const client = tenantClients.get(schemaName)!;
      await client.$disconnect();
      tenantClients.delete(schemaName);
    }
    
    // Eliminar el esquema (CASCADE para eliminar todas las tablas)
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    
    console.log(`Esquema ${schemaName} eliminado exitosamente`);
  } catch (error) {
    console.error(`Error al eliminar esquema para tenant ${tenantId}:`, error);
    throw new Error(`No se pudo eliminar el esquema para el tenant ${tenantId}`);
  }
}

/**
 * Verifica si un esquema de tenant existe
 * @param tenantId - ID del tenant
 * @returns true si el esquema existe, false en caso contrario
 */
export async function tenantSchemaExists(tenantId: string): Promise<boolean> {
  const schemaName = `tenant_${tenantId}`;
  
  try {
    const result = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS(
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = ${schemaName}
      ) as exists
    `;
    
    return result[0]?.exists || false;
  } catch (error) {
    console.error(`Error al verificar esquema para tenant ${tenantId}:`, error);
    return false;
  }
}

/**
 * Lista todos los esquemas de tenants existentes
 * @returns Array de IDs de tenants
 */
export async function listTenantSchemas(): Promise<string[]> {
  try {
    const result = await prisma.$queryRaw<{ schema_name: string }[]>`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_cj%'
      ORDER BY schema_name
    `;
    
    return result.map(row => row.schema_name.replace('tenant_', ''));
  } catch (error) {
    console.error('Error al listar esquemas de tenants:', error);
    return [];
  }
}

/**
 * Cierra todas las conexiones de tenants
 */
export async function disconnectAllTenants(): Promise<void> {
  const promises = Array.from(tenantClients.values()).map(client => 
    client.$disconnect()
  );
  
  await Promise.all(promises);
  tenantClients.clear();
}

// =============================================
// UTILIDADES DE CONEXIÓN
// =============================================

/**
 * Verifica la conexión a la base de datos
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error);
    return false;
  }
}

/**
 * Cierra la conexión principal de Prisma
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  await disconnectAllTenants();
}

// Manejo de señales para cerrar conexiones
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await disconnectPrisma();
  });
  
  process.on('SIGINT', async () => {
    await disconnectPrisma();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

export default prisma;
