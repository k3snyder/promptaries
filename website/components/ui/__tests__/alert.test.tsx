/**
 * Alert Component Tests
 *
 * Tests for Alert UI component used for displaying error messages
 * and notifications on the login page.
 *
 * Following TDD: Tests written BEFORE implementation.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '../alert';

describe('Alert Component', () => {
  describe('Rendering', () => {
    it('should render alert with default variant', () => {
      render(
        <Alert>
          <AlertTitle>Test Title</AlertTitle>
          <AlertDescription>Test description</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render alert with destructive variant', () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should render alert without title', () => {
      render(
        <Alert>
          <AlertDescription>Description only</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Description only')).toBeInTheDocument();
    });

    it('should render alert without description', () => {
      render(
        <Alert>
          <AlertTitle>Title only</AlertTitle>
        </Alert>
      );

      expect(screen.getByText('Title only')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have role="alert" attribute', () => {
      render(
        <Alert>
          <AlertDescription>Accessible alert</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should support custom className', () => {
      render(
        <Alert className="custom-class">
          <AlertDescription>Custom styled alert</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles', () => {
      render(
        <Alert variant="default">
          <AlertDescription>Default alert</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-background');
    });

    it('should apply destructive variant styles', () => {
      render(
        <Alert variant="destructive">
          <AlertDescription>Error alert</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-destructive/50');
    });
  });
});
