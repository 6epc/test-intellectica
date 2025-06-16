import { AbstractControl, ValidationErrors } from '@angular/forms';

// Валидатор принимает имя поля для сравнения (например, 'password')
export const matchPasswordValidator = (matchTo: string) => {
  return (control: AbstractControl): ValidationErrors | null => {
    const parentForm = control.parent; // Получаем родительскую FormGroup
    if (!parentForm) return null;
    const matchingControl = parentForm.get(matchTo); // Получаем контрольное поле
    if (!matchingControl) return null;
    // Проверяем совпадение
    return control.value === matchingControl.value
      ? null
      : { mismatch: true };
  };
};

 export const futureDateValidator = (control: AbstractControl) => {
    const date = new Date(control.value);
    return date > new Date() ? null : { pastDate: true };
  }
