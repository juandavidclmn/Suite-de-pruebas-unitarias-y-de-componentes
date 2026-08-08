import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { TaskForm } from '../../src/components/TaskForm';

describe('TaskForm - Accesibilidad', () => {
  it('el campo de título tiene un accessibilityLabel legible por un lector de pantalla', async () => {
    await render(<TaskForm onSubmit={jest.fn()} />);
    expect(screen.getByLabelText('Título de la tarea')).toBeTruthy();
  });

  it('el botón "Guardar" es identificable como botón por su accessibilityRole', async () => {
    await render(<TaskForm onSubmit={jest.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
  });

  it('expone un único control interactivo, sin botones duplicados o ambiguos para el lector de pantalla', async () => {
    await render(<TaskForm onSubmit={jest.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
