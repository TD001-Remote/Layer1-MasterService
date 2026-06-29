/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/auth/Login';
import Dashboard from '../components/Dashboard';
import GeoZoneManager from '../components/GeoZoneManager';
import SiteProvisioner from '../components/SiteProvisioner';
import StagingAreaNew from '../components/StagingAreaNew';
import ErrorFallback from '../components/ErrorFallback';
// NEW: Registry pages
import EntityRegistry from '../pages/EntityRegistry';
import NonEntityRegistry from '../pages/NonEntityRegistry';
import EntityAssignment from '../pages/EntityAssignment';
import NonEntityAssignment from '../pages/NonEntityAssignment';
// Old pages (kept for backward compatibility during migration)
import EntityDetails from '../pages/entities/EntityDetails';
import EntityEdit from '../pages/entities/EntityEdit';
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
        element: <Dashboard />,
      },
      {
        path: 'geography',
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
      // NEW: Entity Registry routes
      {
        path: 'entity-registry',
        element: <EntityRegistry />,
      },
      {
        path: 'entity-registry/assign/:stagingId',
        element: <EntityAssignment />,
      },
      {
        path: 'entity-registry/:entityPk',
        element: <EntityDetails />,
      },
      {
        path: 'entity-registry/edit/:entityPk',
        element: <EntityEdit />,
      },
      // NEW: Non-Entity Registry routes
      {
        path: 'non-entity-registry',
        element: <NonEntityRegistry />,
      },
      {
        path: 'non-entity-registry/assign/:stagingId',
        element: <NonEntityAssignment />,
      },
    ],
  },
]);
