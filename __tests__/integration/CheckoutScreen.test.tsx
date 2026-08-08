import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CheckoutScreen } from '../../src/screens/CheckoutScreen';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <CheckoutScreen />
    </SafeAreaProvider>
  );

const fill = (testID: string, value: string) =>
  fireEvent.changeText(screen.getByTestId(testID), value);

const fillAll = async (entries: [string, string][]) => {
  for (const [testID, value] of entries) {
    await fill(testID, value);
  }
};

describe('CheckoutScreen - Integración', () => {
  it('muestra error de validación si faltan campos', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByText('Confirmar pago'));
    expect(screen.getByText('Completa todos los campos antes de continuar')).toBeTruthy();
  });

  it('confirma la transacción cuando todos los campos están completos', async () => {
    await renderScreen();

    await fillAll([
      ['input-nombre', 'Juan Pérez'],
      ['input-email', 'juan@correo.com'],
      ['input-telefono', '3000000000'],
      ['input-direccion', 'Calle 123 #45-67'],
      ['input-ciudad', 'Bogotá'],
      ['input-codigo-postal', '110111'],
      ['input-titular', 'Juan Pérez'],
      ['input-numero-tarjeta', '4111111111111111'],
      ['input-vencimiento', '12/28'],
      ['input-cvv', '123'],
    ]);

    await fireEvent.press(screen.getByText('Confirmar pago'));

    await waitFor(() => {
      expect(screen.getByText('Transacción completada exitosamente')).toBeTruthy();
    });
  });

  it('permite corregir los campos después de un error de validación y completar el pago', async () => {
    await renderScreen();

    // Primer intento: solo se llenan los datos de usuario, faltan envío y pago
    await fillAll([
      ['input-nombre', 'Ana Gómez'],
      ['input-email', 'ana@correo.com'],
      ['input-telefono', '3001112233'],
    ]);
    await fireEvent.press(screen.getByText('Confirmar pago'));
    expect(screen.getByText('Completa todos los campos antes de continuar')).toBeTruthy();

    // El usuario corrige completando los campos restantes
    await fillAll([
      ['input-direccion', 'Carrera 10 #20-30'],
      ['input-ciudad', 'Medellín'],
      ['input-codigo-postal', '050001'],
      ['input-titular', 'Ana Gómez'],
      ['input-numero-tarjeta', '4222222222222'],
      ['input-vencimiento', '11/29'],
      ['input-cvv', '456'],
    ]);
    await fireEvent.press(screen.getByText('Confirmar pago'));

    await waitFor(() => {
      expect(screen.getByText('Transacción completada exitosamente')).toBeTruthy();
    });
    expect(screen.queryByText('Completa todos los campos antes de continuar')).toBeNull();
  });

  it('mantiene el estado de cada sección aislado del de las demás', async () => {
    await renderScreen();

    await fill('input-nombre', 'Carlos Ruiz');
    await fill('input-direccion', 'Avenida Siempre Viva 742');
    await fill('input-titular', 'Carlos Ruiz');

    // Cada TextInput conserva únicamente el valor de su propia sección,
    // sin que UserInfoSection, ShippingInfoSection y PaymentInfoSection se pisen entre sí
    expect(screen.getByTestId('input-nombre').props.value).toBe('Carlos Ruiz');
    expect(screen.getByTestId('input-direccion').props.value).toBe('Avenida Siempre Viva 742');
    expect(screen.getByTestId('input-titular').props.value).toBe('Carlos Ruiz');
    expect(screen.getByTestId('input-email').props.value).toBe('');
    expect(screen.getByTestId('input-ciudad').props.value).toBe('');
    expect(screen.getByTestId('input-numero-tarjeta').props.value).toBe('');
  });
});
