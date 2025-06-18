/**
 * Archivo de semilla para Armonía
 * Crea datos iniciales para desarrollo y testing
 */

import { PrismaClient, PlanTipo, RolUsuario } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando semilla de datos...');

  // Limpiar datos existentes
  await prisma.usuario.deleteMany();
  await prisma.conjuntoResidencial.deleteMany();

  console.log('🧹 Datos existentes eliminados');

  // Crear conjunto residencial de prueba
  const conjunto = await prisma.conjuntoResidencial.create({
    data: {
      nombre: 'Conjunto Residencial Villa Armonía',
      nit: '900123456-1',
      direccion: 'Calle 123 #45-67, Bogotá, Colombia',
      telefono: '+57 1 234-5678',
      email: 'admin@villaarmonia.com',
      sitioWeb: 'https://villaarmonia.com',
      representanteLegal: 'María García Pérez',
      tenantId: 'cj0001',
      esquema: 'tenant_cj0001',
      plan: PlanTipo.ESTANDAR,
      maxUnidades: 40,
      configuracion: {
        monedaPrincipal: 'COP',
        idiomaPrincipal: 'es',
        zonaHoraria: 'America/Bogota',
        coloresTema: {
          primario: '#4f46e5',
          secundario: '#ffffff'
        }
      }
    }
  });

  console.log(`✅ Conjunto creado: ${conjunto.nombre} (${conjunto.tenantId})`);

  // Hash para contraseñas de prueba
  const passwordHash = await bcrypt.hash('123456', 10);

  // Crear usuarios de prueba
  const usuarios = await Promise.all([
    // Super Admin
    prisma.usuario.create({
      data: {
        email: 'superadmin@armonia.com',
        telefono: '+57 300 123-4567',
        nombreCompleto: 'Super Administrador',
        password: passwordHash,
        rol: RolUsuario.SUPER_ADMIN,
        activo: true,
        emailVerificado: true,
      }
    }),

    // Admin del conjunto
    prisma.usuario.create({
      data: {
        email: 'admin@villaarmonia.com',
        telefono: '+57 300 234-5678',
        nombreCompleto: 'Carlos Administrador López',
        password: passwordHash,
        rol: RolUsuario.ADMIN_CONJUNTO,
        activo: true,
        emailVerificado: true,
        conjuntoId: conjunto.id,
      }
    }),

    // Residente 1
    prisma.usuario.create({
      data: {
        email: 'residente1@email.com',
        telefono: '+57 300 345-6789',
        nombreCompleto: 'Ana María Rodríguez',
        password: passwordHash,
        rol: RolUsuario.RESIDENTE,
        activo: true,
        emailVerificado: true,
        conjuntoId: conjunto.id,
      }
    }),

    // Residente 2 (también propietario)
    prisma.usuario.create({
      data: {
        email: 'propietario1@email.com',
        telefono: '+57 300 456-7890',
        nombreCompleto: 'Luis Fernando Martínez',
        password: passwordHash,
        rol: RolUsuario.PROPIETARIO,
        activo: true,
        emailVerificado: true,
        conjuntoId: conjunto.id,
      }
    }),

    // Personal de recepción
    prisma.usuario.create({
      data: {
        email: 'recepcion@villaarmonia.com',
        telefono: '+57 300 567-8901',
        nombreCompleto: 'Patricia Recepcionista Silva',
        password: passwordHash,
        rol: RolUsuario.RECEPCION,
        activo: true,
        emailVerificado: true,
        conjuntoId: conjunto.id,
      }
    }),

    // Personal de vigilancia
    prisma.usuario.create({
      data: {
        email: 'vigilancia@villaarmonia.com',
        telefono: '+57 300 678-9012',
        nombreCompleto: 'Roberto Vigilante Torres',
        password: passwordHash,
        rol: RolUsuario.VIGILANCIA,
        activo: true,
        emailVerificado: true,
        conjuntoId: conjunto.id,
      }
    })
  ]);

  console.log(`✅ ${usuarios.length} usuarios creados`);

  // Mostrar información de usuarios creados
  console.log('\n📋 Usuarios de prueba creados:');
  usuarios.forEach(usuario => {
    console.log(`  • ${usuario.nombreCompleto} (${usuario.email}) - ${usuario.rol}`);
  });

  console.log('\n🔑 Contraseña para todos los usuarios: 123456');

  console.log('\n🎯 URLs de acceso:');
  console.log('  • Landing: http://localhost:3000');
  console.log('  • Login: http://localhost:3000/auth/login');
  console.log('  • Admin: http://localhost:3000/admin (después del login como admin)');
  console.log('  • Residente: http://localhost:3000/resident (después del login como residente)');
  console.log('  • Recepción: http://localhost:3000/reception (después del login como recepción)');

  console.log('\n✨ Semilla completada exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en la semilla:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
