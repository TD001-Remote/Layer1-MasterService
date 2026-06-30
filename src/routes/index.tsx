/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/auth/Login';
import AdminSetup from '../pages/auth/AdminSetup';
import DashboardNew from '../components/DashboardNew';
import GeoZoneManager from '../components/GeoZoneManager';
import AdvancedGeographyManager from '../pages/AdvancedGeographyManager';
import SiteProvisioner from '../components/SiteProvisioner';
import StagingAreaNew from '../components/StagingAreaNew';
import ErrorFallback from '../components/ErrorFallback';

// Entity pages (2 pages)
import EntityAssignGeoZone from '../pages/EntityAssignGeoZone';
import EntityManage from '../pages/EntityManage';
import EntityRegistry from '../pages/EntityRegistry';

// Person pages (2 pages)
import { PersonAssignment, PersonManagement } from '../pages/person';

// Non-Entity pages (2 pages)
import NonEntityAssignGeo from '../pages/NonEntityAssignGeo';
import NonEntityManage from '../pages/NonEntityManage';
import NonEntityRegistry from '../pages/NonEntityRegistry';

// DCT - Separate Entity/Non-Entity Classification management
import DCTEntityPage from '../pages/dct/entity/DCTEntityPage';
import DCTNonEntityPage from '../pages/dct/non-entity/DCTNonEntityPage';

// Assignment pages (old - for specific staging links)
import EntityAssignment from '../pages/EntityAssignment';
import NonEntityAssignment from '../pages/NonEntityAssignment';

// L1 to L2 Data Upload
import DataUpload from '../pages/DataUpload';

// Old pages (kept for backward compatibility during migration)
import EntityDetails from '../pages/entities/EntityDetails';
import EntityEdit from '../pages/entities/EntityEdit';
import NonEntityDetails from '../pages/non-entities/NonEntityDetails';
import NonEntityEdit from '../pages/non-entities/NonEntityEdit';
import ZoneDetails from '../pages/geography/ZoneDetails';
import ZoneEdit from '../pages/geography/ZoneEdit';
import SiteDetails from '../pages/sites/SiteDetails';
import SiteEdit from '../pages/sites/SiteEdit';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/admin/setup',
    element: (
      <ProtectedRoute>
        <AdminSetup />
      </ProtectedRoute>
    ),
    errorElement: <ErrorFallback />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorFallback />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardNew />,
      },
      {
        path: 'geography',
        element: <AdvancedGeographyManager />,
      },
      {
        path: 'geography-old',
        element: <GeoZoneManager />,
      },
      {
        path: 'geography/:zoneId',
        element: <ZoneDetails />,
      },
      {
        path: 'geography/edit/:zoneId',
        element: <ZoneEdit />,
      },
      {
        path: 'sites',
        element: <SiteProvisioner />,
      },
      {
        path: 'sites/:siteId',
        element: <SiteDetails />,
      },
      {
        path: 'sites/edit/:siteId',
        element: <SiteEdit />,
      },
      {
        path: 'staging',
        element: <StagingAreaNew />,
      },
      // L1 to L2 Data Upload
      {
        path: 'data-upload',
        element: <DataUpload />,
      },
      // ENTITY: 2 Pages
      {
        path: 'entity-assign',
        element: <EntityAssignGeoZone />,
      },
      {
        path: 'entity-manage',
        element: <EntityManage />,
      },
      // PERSON: 2 Pages
      {
        path: 'person-assign',
        element: <PersonAssignment />,
      },
      {
        path: 'person-manage',
        element: <PersonManagement />,
      },
      // NON-ENTITY: 2 Pages
      {
        path: 'non-entity-assign',
        element: <NonEntityAssignGeo />,
      },
      {
        path: 'non-entity-manage',
        element: <NonEntityManage />,
      },
      // DCT - Separate Entity/Non-Entity Classification pages
      {
        path: 'dct-entity',
        element: <DCTEntityPage />,
      },
      {
        path: 'dct-non-entity',
        element: <DCTNonEntityPage />,
      },
      {
        path: 'entity-registry',
        element: <EntityRegistry />,
      },
      {
        path: 'non-entity-registry',
        element: <NonEntityRegistry />,
      },
      // Legacy assignment pages (for direct staging links)
      {
        path: 'non-entity-registry/assign/:stagingId',
        element: <NonEntityAssignment />,
      },
      // Legacy detail pages
      {
        path: 'entity-registry/:entityPk',
        element: <EntityDetails />,
      },
      {
        path: 'entity-registry/edit/:entityPk',
        element: <EntityEdit />,
      },
      // Non-Entity Details/Edit Routes
      {
        path: 'non-entity-registry/:nonEntityPk',
        element: <NonEntityDetails />,
      },
      {
        path: 'non-entity-registry/edit/:nonEntityPk',
        element: <NonEntityEdit />,
      },
      {
        path: 'non-entity-registry/move-branch/:nonEntityPk',
        element: <Navigate to="/non-entity-assign" replace />,
      },
      {
        path: 'non-entity-registry/assign/:stagingId',
        element: <NonEntityAssignment />,
      },
      {
        path: 'entity-registry/move-branch/:entityPk',
        element: <Navigate to="/entity-registry" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);