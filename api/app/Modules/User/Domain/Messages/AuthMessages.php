<?php

namespace App\Modules\User\Domain\Messages;

use Illuminate\Support\Facades\Password;

final class AuthMessages
{
    public const INVALID_CREDENTIALS = 'E-mail ou senha incorretos. Verifique os dados e tente novamente.';

    public const RESET_LINK_SENT = 'Se o e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.';

    public const PASSWORD_RESET = 'Senha redefinida com sucesso. Você já pode entrar com a nova senha.';

    public const GENERIC_ERROR = 'Não foi possível concluir a operação. Tente novamente.';

    public static function forPasswordStatus(string $status): string
    {
        return match ($status) {
            Password::RESET_LINK_SENT => self::RESET_LINK_SENT,
            Password::PASSWORD_RESET => self::PASSWORD_RESET,
            Password::RESET_THROTTLED => 'Aguarde alguns instantes antes de solicitar novamente.',
            Password::INVALID_TOKEN => 'Link de redefinição inválido ou expirado. Solicite um novo link.',
            Password::INVALID_USER => self::RESET_LINK_SENT,
            default => self::GENERIC_ERROR,
        };
    }
}
