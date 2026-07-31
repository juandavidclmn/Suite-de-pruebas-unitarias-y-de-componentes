import { validateTaskTitle } from '../../src/utils/validateTask';

describe('validateTaskTitle', () => {
  describe('cuando el título es válido', () => {
    it('retorna null para un título con longitud válida', () => {
      expect(validateTaskTitle('Comprar leche')).toBeNull();
    });

    it('retorna null para un título con exactamente 3 caracteres', () => {
      expect(validateTaskTitle('Abc')).toBeNull();
    });

    it('retorna null para un título con exactamente 100 caracteres', () => {
      const titulo100 = 'A'.repeat(100);
      expect(validateTaskTitle(titulo100)).toBeNull();
    });
  });

  describe('cuando el título es inválido', () => {
    it('retorna mensaje de error para un string vacío', () => {
      expect(validateTaskTitle('')).toBe('El título es obligatorio');
    });

    it('retorna mensaje de error para un string con solo espacios', () => {
      expect(validateTaskTitle('   ')).toBe('El título es obligatorio');
    });

    it('retorna mensaje de error para un título con menos de 3 caracteres', () => {
      expect(validateTaskTitle('Ab')).toBe('El título debe tener al menos 3 caracteres');
    });

    it('retorna mensaje de error para un título con más de 100 caracteres', () => {
      const titulo101 = 'A'.repeat(101);
      expect(validateTaskTitle(titulo101)).toBe('El título no puede exceder los 100 caracteres');
    });
  });
});

// ============================================================
// NUEVOS CASOS DE PRUEBA — Actividad Unidad 2
// ============================================================
describe('validateTaskTitle — casos nuevos (Actividad Unidad 2)', () => {
  it('retorna el mensaje de "obligatorio" tanto para null como para undefined (valores nulos)', () => {
    // Arrange: title llega como null/undefined en runtime aunque el tipo declarado sea string
    // Act + Assert
    // @ts-expect-error probando un valor null en runtime
    expect(validateTaskTitle(null)).toBe('El título es obligatorio');
    // @ts-expect-error probando un valor undefined en runtime
    expect(validateTaskTitle(undefined)).toBe('El título es obligatorio');
  });

  it('lanza un error en tiempo de ejecución si se recibe un número en lugar de un string (tipo inesperado)', () => {
    // Arrange: 123 es un valor que TypeScript rechazaría en compilación, pero puede llegar en runtime
    // Act: la función llama a title.trim(), y los números no tienen ese método
    // Assert
    // @ts-expect-error probando un tipo incorrecto en runtime
    expect(() => validateTaskTitle(123)).toThrow();
  });

  it('acepta títulos con emojis dentro del rango de longitud válido (caracteres especiales)', () => {
    // Arrange: título válido en longitud (3-100) que incluye un emoji
    // Act + Assert: la función no rechaza caracteres especiales, solo valida longitud
    expect(validateTaskTitle('Comprar 🥛 leche')).toBe(null);
  });
});
