import { LegalPage, LegalSection, LegalList } from '@/components/legal/LegalPage'

export const metadata = { title: 'Aviso Legal — Caja Neta' }

export default function AvisoLegalPage() {
  return (
    <LegalPage title="Aviso Legal" lastUpdated="2 de abril de 2026">
      <LegalSection title="1. Naturaleza del servicio">
        <p>
          Caja Neta es una herramienta digital de cálculo y análisis basada en información
          proporcionada por el usuario.
        </p>
        <p>Los resultados generados:</p>
        <LegalList
          items={[
            'Son estimaciones',
            'No constituyen asesoramiento profesional',
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Exclusión de responsabilidad">
        <p>Caja Neta no garantiza:</p>
        <LegalList
          items={[
            'Exactitud absoluta de los cálculos',
            'Resultados financieros específicos',
          ]}
        />
        <p>El usuario es el único responsable de:</p>
        <LegalList
          items={[
            'Las decisiones comerciales tomadas',
            'El uso de la información generada',
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Uso bajo responsabilidad del usuario">
        <p>El usuario reconoce que:</p>
        <LegalList
          items={[
            'Los resultados dependen de los datos ingresados',
            'Datos incorrectos generan resultados incorrectos',
          ]}
        />
      </LegalSection>

      <LegalSection title="4. No asesoramiento profesional">
        <p>La Plataforma no reemplaza:</p>
        <LegalList
          items={[
            'Contadores',
            'Asesores financieros',
            'Consultores de negocios',
          ]}
        />
        <p>Se recomienda consultar profesionales para decisiones importantes.</p>
      </LegalSection>

      <LegalSection title="5. Limitación de responsabilidad">
        <p>En ningún caso Caja Neta será responsable por:</p>
        <LegalList
          items={[
            'Pérdidas económicas',
            'Daños directos o indirectos',
            'Interrupciones del servicio',
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Enlaces a terceros">
        <p>
          La Plataforma puede contener enlaces a servicios externos. Caja Neta no se responsabiliza
          por el contenido o funcionamiento de terceros.
        </p>
      </LegalSection>

      <LegalSection title="7. Propiedad intelectual">
        <p>Todo el contenido de la Plataforma es propiedad de Caja Neta. Queda prohibido:</p>
        <LegalList
          items={[
            'Copiar',
            'Distribuir',
            'Modificar sin autorización',
          ]}
        />
      </LegalSection>

      <LegalSection title="8. Disponibilidad">
        <p>No se garantiza acceso continuo e ininterrumpido al servicio.</p>
      </LegalSection>

      <LegalSection title="9. Jurisdicción">
        <p>Este aviso se rige por las leyes de la República Oriental del Uruguay.</p>
      </LegalSection>

      <LegalSection title="10. Contacto">
        <p>
          <a href="mailto:contacto@cajanetaapp.com" className="underline text-gray-900">
            contacto@cajanetaapp.com
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  )
}
