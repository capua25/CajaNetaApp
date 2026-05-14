import { LegalPage, LegalSection, LegalList } from '@/components/legal/LegalPage'

export const metadata = { title: 'Política de Privacidad — Caja Neta' }

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de Privacidad" lastUpdated="2 de abril de 2026">
      <LegalSection title="1. Introducción">
        <p>
          En Caja Neta nos comprometemos a proteger la privacidad de los usuarios. Esta Política de
          Privacidad explica qué datos recopilamos, cómo los usamos y qué derechos tiene el usuario.
        </p>
        <p>Al utilizar la Plataforma, el usuario acepta esta política.</p>
      </LegalSection>

      <LegalSection title="2. Información que recopilamos">
        <p className="font-medium text-gray-800">Información proporcionada por el usuario:</p>
        <LegalList
          items={[
            'Correo electrónico',
            'Datos de productos (costos, precios, márgenes)',
            'Información ingresada en la app',
          ]}
        />
        <p className="font-medium text-gray-800">Información automática:</p>
        <LegalList
          items={[
            'Dirección IP',
            'Tipo de dispositivo',
            'Navegador',
            'Datos de uso (interacciones dentro de la app)',
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Uso de la información">
        <p>Utilizamos los datos para:</p>
        <LegalList
          items={[
            'Proveer y mejorar el servicio',
            'Calcular resultados dentro de la Plataforma',
            'Gestionar cuentas de usuario',
            'Procesar pagos (a través de terceros)',
            'Enviar comunicaciones relacionadas al servicio',
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Pagos">
        <p>
          Los pagos son procesados por terceros (actualmente Mercado Pago). Caja Neta no almacena
          información sensible de pago como datos de tarjetas. Se recomienda revisar las políticas de
          privacidad de dichos proveedores.
        </p>
      </LegalSection>

      <LegalSection title="5. Compartición de datos">
        <p>No vendemos datos personales. Podemos compartir información con:</p>
        <LegalList
          items={[
            'Proveedores tecnológicos (hosting, base de datos, autenticación)',
            'Procesadores de pago',
            'Autoridades legales cuando sea requerido',
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Almacenamiento y seguridad">
        <p>
          Tomamos medidas razonables para proteger la información. Sin embargo, ningún sistema es
          completamente seguro, y no podemos garantizar seguridad absoluta.
        </p>
      </LegalSection>

      <LegalSection title="7. Retención de datos">
        <p>Conservamos los datos mientras:</p>
        <LegalList
          items={[
            'La cuenta esté activa',
            'Sea necesario para proveer el servicio',
            'Sea requerido por obligaciones legales',
          ]}
        />
      </LegalSection>

      <LegalSection title="8. Derechos del usuario">
        <p>El usuario puede:</p>
        <LegalList
          items={[
            'Acceder a sus datos',
            'Solicitar corrección',
            'Solicitar eliminación de su cuenta',
          ]}
        />
        <p>Para ejercer estos derechos, debe contactarse por email.</p>
      </LegalSection>

      <LegalSection title="9. Cookies">
        <p>La Plataforma puede utilizar cookies para:</p>
        <LegalList
          items={[
            'Mantener la sesión iniciada',
            'Mejorar la experiencia del usuario',
            'Analizar el uso de la aplicación',
          ]}
        />
      </LegalSection>

      <LegalSection title="10. Cambios en la política">
        <p>
          Podemos actualizar esta política en cualquier momento. El uso continuo de la Plataforma
          implica aceptación de los cambios.
        </p>
      </LegalSection>

      <LegalSection title="11. Contacto">
        <p>
          Para consultas sobre privacidad:{' '}
          <a href="mailto:contacto@cajanetaapp.com" className="underline text-gray-900">
            contacto@cajanetaapp.com
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  )
}
