<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Exames</title>
<style>body{font-family:sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f5f5f5;font-weight:600}h1{font-size:18px;margin-bottom:16px}</style>
</head>
<body>
<h1>Relatório de Exames</h1>
<table>
<thead><tr>@foreach(($headers ?? ['Colaborador','Tipo','Realização','Vencimento','Observações']) as $h)<th>{{$h}}</th>@endforeach</tr></thead>
<tbody>
@foreach($rows as $e)
<tr>
@foreach(($headers ?? ['Colaborador','Tipo','Realização','Vencimento','Observações']) as $h)
@if($h === 'Colaborador')<td>{{$e->user->name}}</td>
@elseif($h === 'Tipo')<td>{{$e->exam_type}}</td>
@elseif($h === 'Realização')<td>{{$e->execution_date->format('d/m/Y')}}</td>
@elseif($h === 'Vencimento')<td>{{$e->expiration_date->format('d/m/Y')}}</td>
@elseif($h === 'Observações')<td>{{$e->notes ?? '—'}}</td>
@endif
@endforeach
</tr>
@endforeach
</tbody>
</table>
<p style="margin-top:20px;color:#999">Gerado em {{now()->format('d/m/Y H:i')}}</p>
</body>
</html>
