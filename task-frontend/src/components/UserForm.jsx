import { useState } from "react";
import { useTranslation } from 'react-i18next';

function UserForm({ darkMode = false }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Имя обязательно для заполнения";
    }

    if (!email.trim()) {
      newErrors.email = "Email обязателен для заполнения";
    } else if (!validateEmail(email)) {
      newErrors.email = t('userForm.emailInvalid');
    }

    if (!birthDate) {
      newErrors.birthDate = "Дата рождения обязательна";
    } else {
      const age = calculateAge(birthDate);
      if (age === null || age < 0) {
        newErrors.birthDate = "Дата рождения не может быть в будущем";
      } else if (age > 150) {
        newErrors.birthDate = "Проверьте дату рождения";
      } else if (age < 13) {
        newErrors.birthDate = "Возраст должен быть не менее 13 лет";
      }
    }

    if (!gender) {
      newErrors.gender = "Выберите пол";
    }

    if (!country) {
      newErrors.country = "Выберите страну";
    }

    if (!city.trim()) {
      newErrors.city = "Город обязателен для заполнения";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  };

  return (
    <div className={`w-full max-w-[1000px] mx-auto py-6 sm:py-8 md:py-12 px-4 sm:px-8 md:px-16 rounded-2xl shadow-xl min-h-[calc(100vh-100px)] relative transition-colors duration-200 ${
      darkMode ? "bg-gray-800" : "bg-white"
    }`}>
      {showSuccess && (
        <div className="fixed top-4 right-2 sm:right-4 bg-emerald-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg z-50 animate-slide-in max-w-[calc(100vw-1rem)] sm:max-w-none">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">✓</span>
            <span className="text-sm sm:text-base font-semibold">Ваша форма пользователя успешно отправлена</span>
          </div>
        </div>
      )}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 sm:p-6 md:p-8 rounded-xl mb-6 sm:mb-8 md:mb-10 text-white">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-white tracking-tight">
          {t('userForm.title')}
        </h2>
        <p className="text-sm sm:text-base opacity-90 font-normal m-0">
          {t('userForm.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6 md:gap-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label
              htmlFor="name"
              className={`block mb-2.5 text-[15px] font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              {t('userForm.name')} *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              placeholder={t('userForm.namePlaceholder')}
              className={`w-full py-3.5 px-4 text-base border-2 rounded-lg outline-none transition-all duration-300 focus:ring-4 focus:ring-indigo-100 ${
                errors.name
                  ? "border-red-500 focus:border-red-500"
                  : darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-indigo-500"
                    : "bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className={`block mb-2.5 text-[15px] font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              {t('userForm.email')} *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              placeholder={t('userForm.emailPlaceholder')}
              className={`w-full py-3.5 px-4 text-base border-2 rounded-lg outline-none transition-all duration-300 focus:ring-4 focus:ring-indigo-100 ${
                errors.email
                  ? "border-red-500 focus:border-red-500"
                  : darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-indigo-500"
                    : "bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label
              htmlFor="birthDate"
              className={`block mb-2.5 text-[15px] font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              {t('userForm.birthDate')} *
            </label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                if (errors.birthDate) setErrors({ ...errors, birthDate: "" });
              }}
              max={new Date().toISOString().split("T")[0]}
              className={`w-full py-3.5 px-4 text-base border-2 rounded-lg outline-none transition-all duration-300 cursor-pointer focus:ring-4 focus:ring-indigo-100 ${
                errors.birthDate
                  ? "border-red-500 focus:border-red-500"
                  : darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-indigo-500"
                    : "bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white"
              }`}
            />
            {errors.birthDate && (
              <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
            )}
          </div>

          <div>
            <label className={`block mb-2.5 text-[15px] font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              {t('userForm.gender')} *
            </label>
            <div className="flex gap-6 mt-2">
              <label
                className={`flex items-center gap-2.5 cursor-pointer text-base py-3 px-5 rounded-lg border-2 transition-all duration-200 flex-1 justify-center ${
                  gender === "Male"
                    ? darkMode
                      ? "border-indigo-500 bg-indigo-900"
                      : "border-indigo-500 bg-indigo-50"
                    : darkMode
                      ? "border-gray-600 hover:border-indigo-500 hover:bg-gray-700"
                      : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={gender === "Male"}
                  onChange={(e) => {
                    setGender(e.target.value);
                    if (errors.gender) setErrors({ ...errors, gender: "" });
                  }}
                  className={`w-5 h-5 cursor-pointer accent-indigo-500 ${
                    darkMode ? "text-indigo-400" : ""
                  }`}
                />
                <span
                  className={`${
                    gender === "Male" ? "font-semibold" : "font-normal"
                  } ${darkMode ? "text-gray-100" : "text-gray-800"}`}
                >
                  {t('userForm.male')}
                </span>
              </label>
              <label
                className={`flex items-center gap-2.5 cursor-pointer text-base py-3 px-5 rounded-lg border-2 transition-all duration-200 flex-1 justify-center ${
                  gender === "Female"
                    ? darkMode
                      ? "border-indigo-500 bg-indigo-900"
                      : "border-indigo-500 bg-indigo-50"
                    : darkMode
                      ? "border-gray-600 hover:border-indigo-500 hover:bg-gray-700"
                      : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={gender === "Female"}
                  onChange={(e) => {
                    setGender(e.target.value);
                    if (errors.gender) setErrors({ ...errors, gender: "" });
                  }}
                  className={`w-5 h-5 cursor-pointer accent-indigo-500 ${
                    darkMode ? "text-indigo-400" : ""
                  }`}
                />
                <span
                  className={`${
                    gender === "Female" ? "font-semibold" : "font-normal"
                  } ${darkMode ? "text-gray-100" : "text-gray-800"}`}
                >
                  {t('userForm.female')}
                </span>
              </label>
            </div>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label
              htmlFor="country"
              className={`block mb-2.5 text-[15px] font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              {t('userForm.country')} *
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                if (errors.country) setErrors({ ...errors, country: "" });
              }}
              className={`w-full py-3.5 px-4 text-base border-2 rounded-lg outline-none cursor-pointer transition-all duration-300 focus:ring-4 focus:ring-indigo-100 ${
                errors.country
                  ? "border-red-500 focus:border-red-500"
                  : darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-indigo-500"
                    : "bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white"
              }`}
            >
              <option value="">{t('userForm.selectCountry')}</option>
              <option value="Kazakhstan">Kazakhstan</option>
              <option value="USA">USA</option>
              <option value="Germany">Germany</option>
              <option value="Japan">Japan</option>
            </select>
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="city"
              className={`block mb-2.5 text-[15px] font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              {t('userForm.city')} *
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (errors.city) setErrors({ ...errors, city: "" });
              }}
              placeholder={t('userForm.cityPlaceholder')}
              className={`w-full py-3.5 px-4 text-base border-2 rounded-lg outline-none transition-all duration-300 focus:ring-4 focus:ring-indigo-100 ${
                errors.city
                  ? "border-red-500 focus:border-red-500"
                  : darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-indigo-500"
                    : "bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white"
              }`}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>
        </div>
        <button
          type="submit"
          className="mt-2 sm:mt-4 py-3 sm:py-4 px-6 sm:px-8 bg-indigo-500 text-white rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 hover:bg-indigo-600 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {t('userForm.submit')}
        </button>
      </form>

      <div className={`mt-6 sm:mt-8 md:mt-12 p-4 sm:p-6 md:p-8 rounded-xl border-2 shadow-sm ${
        darkMode
          ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
          : "bg-gradient-to-br from-gray-50 to-white border-gray-200"
      }`}>
        <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 ${
          darkMode ? "text-gray-100" : "text-gray-800"
        }`}>
          <span className="text-xl sm:text-2xl">📋</span>
          {t('userForm.enteredData')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className={`p-4 rounded-lg border ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              {t('userForm.name')}
            </div>
            <div className={`text-lg font-medium ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
              {name || "—"}
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              {t('userForm.email')}
            </div>
            <div className={`text-lg font-medium ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
              {email || "—"}
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              {t('userForm.birthDate')}
            </div>
            <div className={`text-lg font-medium ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
              {birthDate || "—"}
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              {t('userForm.gender')}
            </div>
            <div className={`text-lg font-medium ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
              {gender || "—"}
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              {t('userForm.country')}
            </div>
            <div className={`text-lg font-medium ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
              {country || "—"}
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              {t('userForm.city')}
            </div>
            <div className={`text-lg font-medium ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
              {city || "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserForm;
