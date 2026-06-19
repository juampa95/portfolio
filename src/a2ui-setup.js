// Catálogo A2UI (protocolo v0.9, el "current" recomendado por la spec).
// Combina los componentes básicos del catálogo oficial + nuestro chart custom.
// Los estilos de los básicos se inyectan solos al renderizar (useBasicCatalogStyles).
import {
  Text,
  Row,
  Column,
  List,
  Card,
  Divider,
  Image,
  Icon,
  Tabs,
  createComponentImplementation,
} from '@a2ui/react/v0_9'
import { Catalog, BASIC_FUNCTIONS } from '@a2ui/web_core/v0_9'
import SparkBars, { SparkBarsApi } from './components/a2ui/SparkBars.jsx'

// Nuestro componente custom envuelto como implementación del catálogo.
const SparkBarsImpl = createComponentImplementation(SparkBarsApi, SparkBars)

// Id del catálogo: el modelo lo referencia en createSurface.catalogId.
export const CATALOG_ID = 'portfolio'

export const catalog = new Catalog(
  CATALOG_ID,
  [Text, Row, Column, List, Card, Divider, Image, Icon, Tabs, SparkBarsImpl],
  BASIC_FUNCTIONS,
)
