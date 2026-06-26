<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Exames</title>
<style>body{font-family:sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f5f5f5;font-weight:600}h1{font-size:18px;margin-bottom:16px}.expired{color:#dc2626;font-weight:600}</style>
</head>
<body>
<h1>Relatório de Exames Periódicos</h1>
<table>
<thead><tr><th>Colaborador</th><th>Tipo</th><th>Realização</th><th>Vencimento</th><th>Observações</th></tr></thead>
<tbody>
@foreach($rows as $r)
<tr>
  <td>{{$r->user->name}}</td>
  <td>{{$r->exam_type}}</td>
  <td>{{$r->execution_date->format('d/m/Y')}}</td>
  <td class="{{$r->expiration_date->isPast() ? 'expired' : ''}}">{{$r->expiration_date->format('d/m/Y')}}</td>
  <td>{{$r->notes ?? '—'}}</td>
</tr>
@endforeach
</tbody>
</table>
<p style="margin-top:20px;color:#999">Gerado em {{now()->format('d/m/Y H:i')}}</p>
</body>
</html>
