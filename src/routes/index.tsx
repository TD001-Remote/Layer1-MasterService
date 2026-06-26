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
import StagingArea from '../components/StagingArea';
import RegistryViewer from '../components/RegistryViewer';
import NonEntityRegistry from '../components/NonEntityRegistry';
import ErrorFallback from '../components/ErrorFallback';
import EntityDetails from '../pages/entities/EntityDetails';
import EntityEdit from '../pages/entities/EntityEdit';
import EntityCreate from '../pages/entities/EntityCreate';
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
        element: <StagingArea />,
      },
      {
        path: 'registry',
        element: <RegistryViewer />,
      },
      {
        path: 'registry/create',
        element: <EntityCreate />,
      },
      {
        path: 'registry/:entityPk',
        element: <EntityDetails />,
      },
      {
        path: 'registry/edit/:entityPk',
        element: <EntityEdit />,
      },
      {
        path: 'non-entities',
        element: <NonEntityRegistry />,
      },
    ],
  },
]);
