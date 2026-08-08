import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { http, HttpResponse } from 'msw';
import { server } from '../../src/mocks/server';
import { CreateTaskScreen } from '../../src/screens/CreateTaskScreen';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <CreateTaskScreen />
    </SafeAreaProvider>
  );

describe('CreateTaskScreen - Integración', () => {
  it('crea una tarea exitosamente y muestra confirmación', async () => {
    await renderScreen();

    await fireEvent.changeText(
      screen.getByPlaceholderText('Escribe el título de la tarea'),
      'Estudiar pruebas de integración'
    );
    await fireEvent.press(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(screen.getByText('Tarea creada exitosamente')).toBeTruthy();
    });
  });

  it('muestra el banner de error si la API falla', async () => {
    server.use(
      http.post('https://api.taskmanager.com/tasks', () => new HttpResponse(null, { status: 500 }))
    );
    await renderScreen();

    await fireEvent.changeText(
      screen.getByPlaceholderText('Escribe el título de la tarea'),
      'Tarea que no se guarda'
    );
    await fireEvent.press(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(screen.getByText('Error al crear la tarea')).toBeTruthy();
    });
    expect(screen.queryByText('Tarea que no se guarda')).toBeNull();
  });

  it('maneja una respuesta exitosa con datos vacíos sin romper la pantalla', async () => {
    // La API responde 201 pero con campos vacíos en el cuerpo (id y title en blanco)
    server.use(
      http.post('https://api.taskmanager.com/tasks', () =>
        HttpResponse.json({ id: '', title: '', status: 'pending' }, { status: 201 })
      )
    );
    await renderScreen();

    await fireEvent.changeText(
      screen.getByPlaceholderText('Escribe el título de la tarea'),
      'Tarea con respuesta vacía'
    );
    await fireEvent.press(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(screen.getByText('Tarea creada exitosamente')).toBeTruthy();
    });
  });

  it('permite completar y eliminar una tarea recién creada (flujo completo)', async () => {
    await renderScreen();

    await fireEvent.changeText(
      screen.getByPlaceholderText('Escribe el título de la tarea'),
      'Tarea de flujo completo'
    );
    await fireEvent.press(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(screen.getByText('Tarea de flujo completo')).toBeTruthy();
    });

    // El componente (TaskList/TaskCard), el hook (useCreateTask) y el estado
    // local interactúan para marcar la tarea como completada
    await fireEvent.press(
      screen.getByLabelText('Marcar tarea Tarea de flujo completo como completada')
    );
    await waitFor(() => {
      expect(screen.getByText('✓ Completada')).toBeTruthy();
    });

    // Pedir eliminación abre el ConfirmDeleteDialog real (sin mockear)
    await fireEvent.press(screen.getByLabelText('Eliminar tarea Tarea de flujo completo'));
    await waitFor(() => {
      expect(
        screen.getByText(
          '¿Seguro que quieres eliminar "Tarea de flujo completo"? Esta acción no se puede deshacer.'
        )
      ).toBeTruthy();
    });
    await fireEvent.press(screen.getByLabelText('Confirmar eliminación'));

    await waitFor(() => {
      expect(screen.queryByText('Tarea de flujo completo')).toBeNull();
    });
    expect(screen.getByText('No hay tareas aún')).toBeTruthy();
  });
});
