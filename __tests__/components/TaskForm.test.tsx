import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TaskForm } from '../../src/components/TaskForm';

describe('TaskForm', () => {
  it('llama a onSubmit con el título ingresado al presionar "Guardar"', async () => {
    const mockOnSubmit = jest.fn();
    await render(<TaskForm onSubmit={mockOnSubmit} />);

    await fireEvent.changeText(
      screen.getByPlaceholderText('Escribe el título de la tarea'),
      'Mi nueva tarea'
    );
    await fireEvent.press(screen.getByText('Guardar'));

    expect(mockOnSubmit).toHaveBeenCalledWith('Mi nueva tarea');
  });

  it('no llama a onSubmit si el campo está vacío', async () => {
    const mockOnSubmit = jest.fn();
    await render(<TaskForm onSubmit={mockOnSubmit} />);

    await fireEvent.press(screen.getByText('Guardar'));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});

// ============================================================
// NUEVOS CASOS DE PRUEBA — Actividad Unidad 2
// ============================================================
describe('TaskForm — casos nuevos (Actividad Unidad 2)', () => {
  it('permite ubicar el campo de título mediante su testID (getByTestId)', async () => {
    // NOTA: aquí getByPlaceholderText ya serviría, pero se usa getByTestId a propósito
    // para demostrar esta consulta de "último recurso" (PDF, sección 5) sobre el único
    // elemento del proyecto que expone un testID explícito ("input-titulo").
    // jest.fn(): TaskForm exige la prop onSubmit; se aísla porque a esta prueba solo le
    // interesa el estado interno del input, no la lógica de qué hace el padre al guardar.
    await render(<TaskForm onSubmit={jest.fn()} />);
    const input = screen.getByTestId('input-titulo');
    expect(input.props.value).toBe('');
  });

  it('no llama a onSubmit cuando el título contiene solo espacios en blanco (getByRole)', async () => {
    // Arrange
    // jest.fn(): aislamos onSubmit (la función real vive en el componente padre/pantalla)
    // para verificar, sin depender de esa lógica externa, si TaskForm la invoca o no.
    const mockOnSubmit = jest.fn();
    await render(<TaskForm onSubmit={mockOnSubmit} />);

    // Act: caso límite no cubierto antes (solo se probaba el string vacío "", no "solo espacios")
    await fireEvent.changeText(screen.getByPlaceholderText('Escribe el título de la tarea'), '   ');
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));

    // Assert
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
