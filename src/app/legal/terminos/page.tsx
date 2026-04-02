import { LegalPage, LegalSection, LegalList } from '@/components/legal/LegalPage'

export const metadata = { title: 'Términos y Condiciones — Caja Neta' }

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y Condiciones de Uso" lastUpdated="2 de abril de 2026">
      <LegalSection title="1. Introducción">
        <p>
          Estos Términos y Condiciones regulan el acceso y uso de la aplicación "Caja Neta" (en
          adelante, "la Plataforma").
        </p>
        <p>
          Al utilizar la Plataforma, el usuario acepta estos términos en su totalidad. Si no está de
          acuerdo, debe abstenerse de usarla.
        </p>
      </LegalSection>

      <LegalSection title="2. Descripción del servicio">
        <p>Caja Neta es una herramienta digital que permite a los usuarios:</p>
        <LegalList
          items={[
            'Calcular ganancias por producto',
            'Estimar márgenes',
            'Simular precios',
            'Analizar punto de equilibrio',
          ]}
        />
        <p>La Plataforma proporciona estimaciones basadas en los datos ingresados por el usuario.</p>
      </LegalSection>

      <LegalSection title="3. Uso del servicio">
        <p>El usuario se compromete a:</p>
        <LegalList
          items={[
            'Proporcionar información veraz',
            'No utilizar la Plataforma con fines ilegales',
            'No intentar vulnerar la seguridad del sistema',
            'No copiar, revender o explotar el servicio sin autorización',
          ]}
        />
        <p>El incumplimiento podrá resultar en la suspensión o cancelación de la cuenta.</p>
      </LegalSection>

      <LegalSection title="4. Registro de cuenta">
        <p>
          Para acceder a ciertas funcionalidades, el usuario deberá registrarse proporcionando un
          correo electrónico y contraseña.
        </p>
        <p>El usuario es responsable de:</p>
        <LegalList
          items={[
            'Mantener la confidencialidad de sus credenciales',
            'Todas las actividades realizadas desde su cuenta',
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Planes y pagos">
        <p>La Plataforma puede ofrecer versiones gratuitas y de pago.</p>
        <p className="font-medium text-gray-800">Plan gratuito</p>
        <LegalList items={['Acceso limitado a funcionalidades']} />
        <p className="font-medium text-gray-800">Plan de pago (Plus)</p>
        <LegalList
          items={[
            'Acceso a hasta 200 productos',
            'Facturación recurrente mediante terceros (actualmente Mercado Pago)',
          ]}
        />
        <p className="font-medium text-gray-800">Plan de pago (Pro)</p>
        <LegalList
          items={[
            'Acceso a productos ilimitados y funcionalidades avanzadas',
            'Facturación recurrente mediante terceros (actualmente Mercado Pago)',
          ]}
        />
        <p>Los pagos:</p>
        <LegalList
          items={[
            'Son procesados por plataformas externas',
            'Pueden renovarse automáticamente según el plan seleccionado',
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Cancelaciones y reembolsos">
        <p>El usuario puede cancelar su suscripción en cualquier momento.</p>
        <p>Salvo disposición legal en contrario:</p>
        <LegalList
          items={[
            'No se realizan reembolsos por períodos ya facturados',
            'El acceso al plan Pro se mantiene hasta el final del ciclo de facturación',
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Limitación de responsabilidad">
        <p>Caja Neta es una herramienta de apoyo. El usuario reconoce que:</p>
        <LegalList
          items={[
            'Los resultados son estimaciones',
            'No constituyen asesoramiento financiero, contable o legal',
          ]}
        />
        <p>Caja Neta no se hace responsable por:</p>
        <LegalList
          items={[
            'Decisiones comerciales tomadas por el usuario',
            'Pérdidas económicas',
            'Errores derivados de datos ingresados incorrectamente',
          ]}
        />
      </LegalSection>

      <LegalSection title="8. Disponibilidad del servicio">
        <p>No se garantiza que la Plataforma esté disponible de forma ininterrumpida. Caja Neta podrá:</p>
        <LegalList
          items={[
            'Modificar o suspender el servicio',
            'Actualizar funcionalidades',
            'Realizar mantenimiento',
          ]}
        />
      </LegalSection>

      <LegalSection title="9. Propiedad intelectual">
        <p>Todos los derechos sobre la Plataforma pertenecen a Caja Neta. Queda prohibido:</p>
        <LegalList
          items={[
            'Copiar el software',
            'Reproducir el diseño',
            'Utilizar la marca sin autorización',
          ]}
        />
      </LegalSection>

      <LegalSection title="10. Protección de datos">
        <p>
          El uso de la Plataforma implica la recopilación de datos personales. Estos serán tratados
          conforme a la Política de Privacidad correspondiente.
        </p>
      </LegalSection>

      <LegalSection title="11. Modificaciones">
        <p>
          Caja Neta podrá modificar estos términos en cualquier momento. Las modificaciones serán
          notificadas mediante la Plataforma. El uso continuado implica aceptación de los cambios.
        </p>
      </LegalSection>

      <LegalSection title="12. Terminación">
        <p>Caja Neta podrá suspender o cancelar cuentas en caso de:</p>
        <LegalList
          items={['Incumplimiento de estos términos', 'Uso indebido del servicio']}
        />
      </LegalSection>

      <LegalSection title="13. Legislación aplicable">
        <p>Estos términos se rigen por las leyes de la República Oriental del Uruguay.</p>
      </LegalSection>

      <LegalSection title="14. Contacto">
        <p>
          Para consultas:{' '}
          <a href="mailto:contacto@cajanetaapp.com" className="underline text-gray-900">
            contacto@cajanetaapp.com
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  )
}
